"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  User, 
  Calendar, 
  DollarSign,
  FileText,
  Star,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  amount: number;
  purpose: string;
  daysUntilDue: number;
  icon: string;
  category: string;
}

interface UserTemplate {
  id: string;
  name: string;
  amount: number;
  purpose: string;
  daysUntilDue: number;
  isDefault: boolean;
  useCount: number;
}

interface TemplateSelectorProps {
  onSelect: (template: {
    amount: number;
    purpose: string;
    daysUntilDue: number;
  }) => void;
  onClose?: () => void;
}

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [systemTemplates, setSystemTemplates] = useState<SystemTemplate[]>([]);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"system" | "user">("system");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to load templates");
      
      const data = await response.json();
      setSystemTemplates(data.systemTemplates || []);
      setUserTemplates(data.userTemplates || []);
      
      // Auto-switch to user tab if user has templates
      if (data.userTemplates?.length > 0) {
        setSelectedTab("user");
      }
    } catch (error: any) {
      toast.error("Failed to load templates", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template: SystemTemplate | UserTemplate) => {
    // Increment use count for user templates
    if ('useCount' in template) {
      try {
        await fetch(`/api/templates/${template.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...template,
            useCount: template.useCount + 1
          })
        });
      } catch (error) {
        console.error("Failed to update template use count:", error);
      }
    }

    onSelect({
      amount: template.amount,
      purpose: template.purpose,
      daysUntilDue: template.daysUntilDue
    });

    toast.success("Template applied!", {
      description: `Using "${template.name}" template`
    });

    if (onClose) onClose();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Emergency': 'bg-red-100 text-red-700',
      'Education': 'bg-blue-100 text-blue-700',
      'Business': 'bg-purple-100 text-purple-700',
      'Personal': 'bg-green-100 text-green-700',
      'Medical': 'bg-pink-100 text-pink-700',
      'Travel': 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading templates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Quick Start Templates
        </CardTitle>
        <CardDescription>
          Start with a pre-configured template or use your saved ones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "system" | "user")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Pre-built ({systemTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Templates ({userTemplates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-3 mt-0">
            {systemTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No system templates available</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {systemTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="text-2xl">{template.icon}</span>
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge className={getCategoryColor(template.category)} variant="secondary">
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">${template.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{template.daysUntilDue} days</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{template.purpose}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="user" className="space-y-3 mt-0">
            {userTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="mb-2">No saved templates yet</p>
                <p className="text-xs">Create templates in Settings → Loan Templates</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {userTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {template.isDefault && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {template.name}
                        </span>
                        {template.useCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {template.useCount}x
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">${template.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{template.daysUntilDue} days</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{template.purpose}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
