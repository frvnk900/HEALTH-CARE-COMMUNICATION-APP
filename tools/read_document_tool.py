from pypdf import PdfReader


def read_document(filepath: str) -> str:
    try:
        if filepath.endswith(".txt"):
            with open(filepath, 'r') as file:
                lines = file.readlines()
            return ''.join(lines)  
        elif filepath.endswith(".pdf"):
            reader = PdfReader(filepath) 
            page = reader.pages[len(reader.pages) - 1] 
            return page.extract_text()
        else:
            return "no text extracted due to invalid file type"
    except Exception as e:
        return str(e)
