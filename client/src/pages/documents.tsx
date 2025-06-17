import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, Download, FileText, AlertTriangle, Shield, ClipboardCheck } from "lucide-react";
import DocumentUpload from "@/components/document-upload";
import { apiRequest } from "@/lib/queryClient";

const documentCategories = [
  {
    name: "Emergency Procedures",
    icon: AlertTriangle,
    color: "safety-critical",
    bgColor: "bg-red-50",
  },
  {
    name: "Safety Equipment",
    icon: Shield,
    color: "primary-blue",
    bgColor: "bg-blue-50",
  },
  {
    name: "Compliance",
    icon: ClipboardCheck,
    color: "safety-green",
    bgColor: "bg-green-50",
  },
];

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents", { search: searchQuery, category: selectedCategory }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      return fetch(`/api/documents?${params.toString()}`, { credentials: "include" })
        .then(res => res.json());
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowUpload(false);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const documentsByCategory = documents?.reduce((acc: any, doc: any) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {}) || {};

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query key dependency
  };

  const handleUpload = async (file: File, title: string, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category);
    
    await uploadMutation.mutateAsync(formData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Safety Documents</h2>
        <p className="text-gray-600">Access and manage safety protocols, procedures, and compliance documents</p>
      </div>

      {/* Search and Upload */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search safety documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <Button 
              onClick={() => setShowUpload(true)}
              className="bg-primary-blue hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {documentCategories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
              >
                <category.icon className="h-4 w-4 mr-1" />
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentCategories.map((category) => {
          const categoryDocs = documentsByCategory[category.name] || [];
          const IconComponent = category.icon;
          
          return (
            <Card key={category.name} className={category.bgColor}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 bg-white`}>
                    <IconComponent className={`h-5 w-5 text-${category.color}`} />
                  </div>
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryDocs.slice(0, 3).map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{doc.title}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {categoryDocs.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No documents in this category</p>
                  )}
                  
                  {categoryDocs.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-4 text-primary-blue hover:text-blue-700"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      View All ({categoryDocs.length} documents)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All Documents View */}
      {(searchQuery || selectedCategory) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : `${selectedCategory} Documents`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents?.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.title}</h4>
                        <p className="text-sm text-gray-500">{doc.category}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "No documents in this category yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
          isUploading={uploadMutation.isPending}
          categories={documentCategories.map(c => c.name)}
        />
      )}
    </div>
  );
}
