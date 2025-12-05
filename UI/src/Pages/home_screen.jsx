import React from 'react';
import { io } from 'socket.io-client';
import Sidebar from '../components/menu';
import Messages from '../components/message_bubble';
import './styles/home.css';

function Home() {
  const [message, setMessage] = React.useState('');
  const [showMessages, setShowMessages] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversation, setConversation] = React.useState([]);
  const [socket, setSocket] = React.useState(null);
  const [isConnected, setIsConnected] = React.useState(false);
 
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef(null);
 
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  
  React.useEffect(() => {
    const user_id = getUserIdFromToken();
    if (!user_id) {
      console.error('No user ID found');
      return;
    }

    const newSocket = io('http://127.0.0.1:8001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
     
      newSocket.emit('/chat/v1/ai/stream-chat', { user_id });
    });

    newSocket.on('connected', (data) => {
      console.log('Stream connected:', data.message);
    });

    newSocket.on('new_message', (conversationData) => {
      console.log('Received conversation:', conversationData);
      if (Array.isArray(conversationData)) {
        setConversation(conversationData);
        console.log('Conversation set:', conversationData);
        setShowMessages(true);
        setIsLoading(false);  
      }
    });

    newSocket.on('ai_response', (data) => {
      console.log('AI response received:', data);
      if (data.response) {
        setConversation(prev => [
          ...prev,
          {
            role: 'ai',
            content: data.response,
            time: new Date().toISOString(),
            streaming: false
          }
        ]);
        setIsLoading(false);  
      }
    });
  
    newSocket.on('stream_start', (data) => {
      console.log('Stream started:', data);
      console.log(conversation)
      setIsLoading(true); 
      console.log('Stream started:', data);
    
      setConversation(prev => [
        ...prev,
        {
          role: 'ai',
          content: '',
          time: new Date().toISOString(),
          streaming: true
        }
      ]);
    });

    newSocket.on('stream_chunk', (data) => {
      console.log('Stream chunk:', data);
      if (data.chunk) {
        setConversation(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'ai' && lastMessage.streaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + data.chunk
              }
            ];
          }
          return prev;
        });
      }
    });

    newSocket.on('stream_end', (data) => {
      console.log('Stream ended:', data);
      setIsLoading(false); 
    
      setConversation(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.streaming) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              streaming: false
            }
          ];
        }
        return prev;
      });
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setIsLoading(false); 
      
      setConversation(prev => [
        ...prev,
        {
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          time: new Date().toISOString(),
          error: true
        }
      ]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setIsLoading(false); 
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

   
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

     
    const validTypes = [
      'text/plain',
      'application/pdf',
      'text/markdown',
      'text/csv'
    ];
    
    const validExtensions = ['.txt', '.pdf', '.md', '.csv'];
    const maxSize = 10 * 1024 * 1024; 

    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);

    if (!isValidType) {
      console.log(`Only .txt and .pdf files are allowed: ${file.name}`);
      return;
    }

    if (file.size > maxSize) {
      console.log(`File too large: ${file.name}. Maximum size is 10MB`);
      return;
    }

    setSelectedFile(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
 
    if ((!message.trim() && !selectedFile) || !socket || !isConnected) {
      console.log('Cannot send: no message or file', { 
        hasMessage: !!message.trim(), 
        hasFile: !!selectedFile, 
        hasSocket: !!socket, 
        isConnected 
      });
      return;
    }

    const user_id = getUserIdFromToken();
    if (!user_id) {
      console.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
 
    const userMessage = {
      role: 'user',
      content: message || `Uploaded file: ${selectedFile?.name}`,
      time: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    
    if (!showMessages) {
      setShowMessages(true);
    }

    try {
      const formData = new FormData();
      formData.append('user_id', user_id);
      
      
      if (currentMessage.trim()) {
        formData.append('user_input', currentMessage);
      }
      
     
      if (selectedFile) {
        formData.append('user_uploaded_file', selectedFile);
      }

      const xhr = new XMLHttpRequest();
      
     
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      await new Promise((resolve, reject) => {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              console.log('Message and file sent successfully:', response);
              
      
              resolve(response);
            } else {
              setIsLoading(false); 
              reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
          }
        };

        xhr.open('POST', 'http://127.0.0.1:8001/chat/v1/messages');
        xhr.send(formData);
      });

      
      setSelectedFile(null);
      setUploadProgress(0);

    } catch (error) {
      console.error('Error sending message and file:', error);
      setIsLoading(false);
      setIsUploading(false);
      
      setConversation(prev => [
        ...prev,
        {
          role: 'ai',
          content: 'Sorry, I encountered an error while sending your message. Please try again.',
          time: new Date().toISOString(),
          error: true
        }
      ]);
    } finally {
      setIsUploading(false);
 
    }
  };

 
  const handleAttachmentClick = () => {
    if (fileInputRef.current && !selectedFile) {
      fileInputRef.current.click();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

 
  const testSocket = () => {
    if (socket && isConnected) {
      const user_id = getUserIdFromToken();
      socket.emit('/chat/v1/ai/stream-chat', { user_id });
    }
  };

  return (
    <div className="home-root font-display dark">
     
   <div
        className="background-image-layer"
        data-alt="A softly blurred background image of a doctor using a tablet, representing modern healthcare in Africa."
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBsl5xKFUwyPrzFdU4NVm8dRNWS03SX5Grib5E2uh6fywyhhPB6pZepud0U9EeYRkCiU15Z1kopdk14Ju2tv1dNFiTl4rGHhEmlI5VE6nk3A6sdtAQ_1cMrkyqcdf4NfkWlS5tUtvD8_K_DlUTxk6UUBY6xhKpHM17z_hlwp4y9-tpRBePXJ3XNIpPCu5z6b7yvpNUMi-sw8ZxqeyvFdWWjBATzolqDH7ngUxB4f3V-zv07xOnwS3-UsqHSeDMOdQ8z8nyjPvl26s")',
        }}
      ></div>
      
      <div className="background-overlay"></div>

      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".txt,.pdf"
        style={{ display: 'none' }}
      />

     
      {/* <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢Online' : '🔴Offline'}
        {isConnected && (
          <p>-</p>
        )}
      </div> */}

      <div className="home-container">
        
        <Sidebar />

      
        <main className="main-content">
          <div className="content-wrapper">
   
            <div className="chat-area">
              {showMessages || conversation.length > 0 ? (
                <Messages conversation={conversation} />
              ) : (
                <div className="empty-chat">
                  <p className="empty-text">Start a conversation with MoyoAI</p>
                  {!isConnected && (
                    <p className="connection-warning">
                      🔴 Connecting to server...
                    </p>
                  )}
                </div>
              )}
            </div>

           
            <div className="input-section">
              <form onSubmit={handleSubmit} className="input-form">
                <div className="input-wrapper">
                  <button
                    type="button"
                    className="attachment-button"
                    onClick={handleAttachmentClick}
                    disabled={isLoading || !isConnected || isUploading || selectedFile}
                    title={
                      !isConnected ? "Not connected to server" : 
                      selectedFile ? "File selected - remove current file first" : 
                      "Attach .txt or .pdf file"
                    }
                  >
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                  <input
                    className="message-input"
                    placeholder={
                      !isConnected 
                        ? "Connecting to server..." 
                        : selectedFile 
                        ? "Add a message about the file (optional)..." 
                        : "Ask MoyoAI about patient symptoms, diagnosis, or treatment..."
                    }
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || !isConnected || isUploading}
                  />
                  <button 
                    className={`send-button ${isLoading || !isConnected || isUploading ? 'send-button-disabled' : ''}`} 
                    type="submit"
                    disabled={isLoading || !isConnected || (!message.trim() && !selectedFile) || isUploading}
                    title={
                      !isConnected ? "Not connected to server" : 
                      (!message.trim() && !selectedFile) ? "Enter a message or select a file" :
                      "Send message and file"
                    }
                  >
                    {isLoading || isUploading ? (
                      <div className="button-loading">
                        <div className="button-spinner"></div>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined">send</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;