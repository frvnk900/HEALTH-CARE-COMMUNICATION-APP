import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './styles/messages.css';

function Messages({ conversation }) {
  const messagesEndRef = React.useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const copyToClipboard = async (text, messageIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageIndex);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const CopyButton = ({ content, messageIndex }) => {
    return (
      <button 
        className={`copy-button ${copiedMessageId === messageIndex ? 'copied' : ''}`}
        onClick={() => copyToClipboard(content, messageIndex)}
        title="Copy message"
      >
        <span className="material-symbols-outlined copy-icon">
          {copiedMessageId === messageIndex ? 'check' : 'content_copy'}
        </span>
        <span className="copy-tooltip">
          {copiedMessageId === messageIndex ? 'Copied!' : 'Copy'}
        </span>
      </button>
    );
  };

  const renderMarkdown = (content, messageIndex) => {
    return (
      <div className="markdown-content">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
            h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
            h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
            ul: ({node, ...props}) => <ul className="markdown-list" {...props} />,
            ol: ({node, ...props}) => <ol className="markdown-list" {...props} />,
            li: ({node, ...props}) => <li className="markdown-list-item" {...props} />,
            strong: ({node, ...props}) => <strong className="markdown-strong" {...props} />,
            em: ({node, ...props}) => <em className="markdown-em" {...props} />,
            code: ({node, inline, ...props}) => 
              inline ? 
                <code className="markdown-inline-code" {...props} /> : 
                <code className="markdown-code-block" {...props} />,
            a: ({node, href, children, ...props}) => (
              <a 
                href={href} 
                className="message-link"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            ),
            p: ({node, ...props}) => <p className="markdown-paragraph" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
        <CopyButton content={content} messageIndex={messageIndex} />
      </div>
    );
  };

  const processHtmlLinks = (content, messageIndex) => {
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        parts.push(
          <span key={`text-${lastIndex}`}>
            {textBefore.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </span>
        );
      }

      // Add the link
      const [, , href, linkText] = match;
      parts.push(
        <a 
          key={`link-${match.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="message-link"
          onClick={(e) => {
            if (href.includes('/files/download/')) {
              console.log('Downloading file:', href);
            }
          }}
        >
          {linkText || 'Download File'}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last link
    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex);
      parts.push(
        <span key={`text-${lastIndex}`}>
          {textAfter.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </span>
      );
    }

    return (
      <div className="message-content-text">
        {parts}
        <CopyButton content={content} messageIndex={messageIndex} />
      </div>
    );
  };

  const processMixedContent = (content, messageIndex) => {
    // Convert HTML links to markdown links
    const convertedContent = content.replace(
      /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi,
      '[$3]($2)'
    );
    
    return renderMarkdown(convertedContent, messageIndex);
  };

  const formatMessageContent = (content, messageIndex) => {
    if (!content) return null;

    // Check if content contains HTML links
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi;
    const hasHtmlLinks = linkRegex.test(content);
    
    // Check if content contains markdown formatting (excluding HTML)
    const htmlStripped = content.replace(/<[^>]*>/g, '');
    const hasMarkdown = /(\*\*|\*|_|`|#|\n\s*[-*+]\s|\n\s*\d+\.\s)/.test(htmlStripped);

    // Case 1: Has HTML links AND markdown
    if (hasHtmlLinks && hasMarkdown) {
      return processMixedContent(content, messageIndex);
    }
    
    // Case 2: Has only HTML links (no markdown)
    if (hasHtmlLinks && !hasMarkdown) {
      return processHtmlLinks(content, messageIndex);
    }
    
    // Case 3: Has only markdown (no HTML links)
    if (hasMarkdown && !hasHtmlLinks) {
      return renderMarkdown(content, messageIndex);
    }
    
    // Case 4: Plain text (no HTML links, no markdown)
    return (
      <div className="message-content-text">
        {content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
        <CopyButton content={content} messageIndex={messageIndex} />
      </div>
    );
  };

  const hasDownloadLink = (content) => {
    return content && content.includes('<a href=') && content.includes('/files/download/');
  };

  const renderFileUploadMessage = (message) => {
    return (
      <div className="file-upload-message">
        <div className="file-upload-icon">📎</div>
        <div className="file-upload-content">
          <div className="file-upload-text">{message.content}</div>
          <div className="file-upload-time">{formatTime(message.time)}</div>
        </div>
      </div>
    );
  };

  const renderDownloadMessage = (message, index) => {
    return (
      <div className="download-message">
        <div className="download-icon"></div>
        <div className="download-content">
          <div className="download-text">
            {formatMessageContent(message.content, index)}
          </div>
          <div className="download-time">{formatTime(message.time)}</div>
        </div>
      </div>
    );
  };

  const renderRegularMessage = (message, index) => {
    return (
      <>
        {formatMessageContent(message.content, index)}
        <div className="message-time">
          {formatTime(message.time)}
        </div>
      </>
    );
  };

  return (
    <div className="messages-container">
      <div className="messages-list">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'} ${message.error ? 'error-message' : ''} ${message.streaming ? 'streaming-message' : ''} ${message.isFileUpload ? 'file-upload-system-message' : ''} ${hasDownloadLink(message.content) ? 'download-link-message' : ''}`}
          >
            <div className="message-content">
              {message.isFileUpload 
                ? renderFileUploadMessage(message) 
                : hasDownloadLink(message.content)
                ? renderDownloadMessage(message, index)
                : renderRegularMessage(message, index)
              }
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default Messages;