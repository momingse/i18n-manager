import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";
import {
  CheckCircle,
  Code,
  Edit3,
  FileText,
  ImageIcon,
  Menu,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { toggle } = useSidebarStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (type: string, content: string | File[]) => {
    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const existingContent = JSON.parse(
        localStorage.getItem("uploadedContent") || "[]",
      );
      const newContent = {
        id: Date.now(),
        type,
        content:
          type === "files" ? (content as File[]).map((f) => f.name) : content,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        "uploadedContent",
        JSON.stringify([...existingContent, newContent]),
      );

      toast("Content uploaded successfully", {
        description: `${type === "files" ? "Files" : "Content"} ready for translation`,
      });

      // Reset form
      if (type === "files") {
        setFiles([]);
      } else if (type === "text") {
        setTextContent("");
      } else {
        setCodeContent("");
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Desktop Header */}
        <div className="text-center mb-6 animate-in fade-in slide-in-from-top duration-600 sm:hidden">
          <h1 className="text-3xl font-bold mb-2">Upload Content</h1>
          <p className="text-muted-foreground">Add content to translate</p>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Button variant="outline" onClick={toggle}>
                <Menu className="w-6 h-6" />
              </Button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Upload Content</h1>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger
                value="files"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Code</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="files"
              className="animate-in fade-in duration-300"
            >
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    Upload Files
                  </CardTitle>
                  <CardDescription className="text-base">
                    Upload images or documents containing text to translate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden",
                      dragActive
                        ? "border-primary bg-primary/5 scale-105 shadow-lg"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20 hover:scale-[1.02] hover:shadow-md",
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    {/* Background gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 space-y-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>

                      <div className="space-y-3">
                        <p className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                          Drop files here or click to upload
                        </p>
                        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                          Supports images (PNG, JPG, GIF) and text files
                          <br />
                          <span className="text-xs sm:text-sm font-medium text-primary/80">
                            Click anywhere in this area to browse files
                          </span>
                        </p>
                      </div>

                      {/* Visual indicators */}
                      <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2 sm:pt-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-muted/50 rounded-full text-xs sm:text-sm font-medium">
                          <Upload className="w-4 h-4" />
                          Drag & Drop
                        </div>
                        <div className="text-muted-foreground">or</div>
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                          <FileText className="w-4 h-4" />
                          Click to Browse
                        </div>
                      </div>
                    </div>

                    {/* Ripple effect on click */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-20 bg-primary transition-opacity duration-150" />

                    <Input
                      type="file"
                      multiple
                      accept="image/*,.txt,.md,.json"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-400">
                      <h3 className="font-semibold text-lg">Selected Files</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors duration-200 animate-in fade-in slide-in-from-left"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm sm:font-medium">
                                {file.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="hover:bg-destructive/20 hover:text-destructive transition-colors duration-200"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleSubmit("files", files)}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Upload Files
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="text"
              className="animate-in fade-in duration-300"
            >
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    Text Content
                  </CardTitle>
                  <CardDescription className="text-base">
                    Paste or type text content directly for translation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label
                      htmlFor="text-content"
                      className="text-base font-medium"
                    >
                      Text to Translate
                    </Label>
                    <Textarea
                      id="text-content"
                      placeholder="Enter your text content here..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows={8}
                      sm:rows={12}
                      className="mt-3 resize-none border-0 bg-muted/50 focus:bg-muted/70 transition-colors duration-200 text-base"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("text", textContent)}
                    disabled={!textContent.trim() || isUploading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-200"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Submit Text
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="code"
              className="animate-in fade-in duration-300"
            >
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Code className="w-5 h-5 text-purple-600" />
                    </div>
                    Code Snippets
                  </CardTitle>
                  <CardDescription className="text-base">
                    Upload code files or paste code snippets with translatable
                    strings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label
                      htmlFor="code-content"
                      className="text-base font-medium"
                    >
                      Code Content
                    </Label>
                    <Textarea
                      id="code-content"
                      placeholder="Paste your code here..."
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      rows={10}
                      sm:rows={15}
                      className="mt-3 font-mono text-sm resize-none border-0 bg-muted/50 focus:bg-muted/70 transition-colors duration-200"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("code", codeContent)}
                    disabled={!codeContent.trim() || isUploading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 transition-all duration-200"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Submit Code
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
