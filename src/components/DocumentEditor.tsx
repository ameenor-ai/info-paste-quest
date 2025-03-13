
import React, { useState, useEffect } from 'react';
import { useDocuments } from '@/context/DocumentContext';
import { analyzeDocument } from '@/utils/documentAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DocumentEditor: React.FC = () => {
  const { currentDocument, updateDocument, createDocument } = useDocuments();
  const [title, setTitle] = useState(currentDocument?.title || 'Untitled Document');
  const [content, setContent] = useState(currentDocument?.content || '');
  const [stats, setStats] = useState(analyzeDocument(content));
  const { toast } = useToast();

  // Update local state when current document changes
  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setContent(currentDocument.content);
      setStats(analyzeDocument(currentDocument.content));
    } else {
      setTitle('Untitled Document');
      setContent('');
      setStats(analyzeDocument(''));
    }
  }, [currentDocument]);

  // Update document stats when content changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      setStats(analyzeDocument(content));
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [content]);

  const handleSave = () => {
    if (currentDocument) {
      updateDocument(currentDocument.id, title, content);
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully."
      });
    } else {
      createDocument(title, content);
      toast({
        title: "Document created",
        description: "New document has been created successfully."
      });
    }
  };

  const handleNewDocument = () => {
    createDocument('Untitled Document', '');
    toast({
      title: "New document created",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-docblue-500" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-semibold text-lg border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            placeholder="Document Title"
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleNewDocument}>
            New Document
          </Button>
          <Button onClick={handleSave} className="bg-docblue-500 hover:bg-docblue-600">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <Card className="flex-grow">
        <CardContent className="p-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60vh] resize-none border-none rounded-lg p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Paste your text or data here..."
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between text-sm text-gray-500 mt-2 px-1">
        <span>{stats.wordCount} words | {stats.charCount} characters</span>
        <span>{stats.paragraphCount} paragraphs | ~{stats.readingTimeMinutes} min read</span>
      </div>
    </div>
  );
};

export default DocumentEditor;
