"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Send, Loader2, Bot, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DisputeChatProps {
  loanId: string;
  currentUserId: string;
}

interface Message {
  id: string;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
  };
}

interface Dispute {
  id: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  messages: Message[];
}

export function DisputeChat({ loanId, currentUserId }: DisputeChatProps) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [requestAi, setRequestAi] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDispute();
  }, [loanId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dispute?.messages]);

  const loadDispute = async () => {
    try {
      const res = await fetch(`/api/loans/${loanId}/disputes`);
      const data = await res.json();
      
      if (res.ok && data.dispute) {
        setDispute(data.dispute);
      }
    } catch (error) {
      console.error("Failed to load dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/disputes/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message.trim(),
          requestAiMediation: requestAi
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("");
        setRequestAi(false);
        await loadDispute();
        if (requestAi) {
          toast.success("AI mediator has responded");
        }
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!dispute) {
    return null;
  }

  return (
    <Card className="border-gray-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Dispute Resolution
            </CardTitle>
            <CardDescription>AI-mediated dispute resolution</CardDescription>
          </div>
          <Badge variant={dispute.status === "RESOLVED" ? "default" : "secondary"} className="gap-1">
            {dispute.status === "RESOLVED" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {dispute.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {dispute.messages.map((msg, idx) => {
              const isCurrentUser = msg.sender.id === currentUserId;
              const displayName = msg.sender.firstName && msg.sender.lastName
                ? `${msg.sender.firstName} ${msg.sender.lastName}`
                : msg.sender.email;

              return (
                <div key={msg.id}>
                  {msg.isAiGenerated ? (
                    // AI Message
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-1">AI Mediator</p>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <p className="text-xs text-gray-600 mt-2">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // User Message
                    <div className={cn(
                      "flex gap-3",
                      isCurrentUser && "flex-row-reverse"
                    )}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={msg.sender.imageUrl || undefined} />
                        <AvatarFallback className={cn(
                          isCurrentUser ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900"
                        )}>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "flex-1 min-w-0",
                        isCurrentUser && "flex flex-col items-end"
                      )}>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{displayName}</p>
                        <div className={cn(
                          "inline-block rounded-lg p-3 max-w-[80%]",
                          isCurrentUser 
                            ? "bg-gray-800 text-white" 
                            : "bg-gray-100 text-gray-900"
                        )}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {idx < dispute.messages.length - 1 && <Separator className="my-4" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Input */}
        {dispute.status !== "RESOLVED" && (
          <div className="space-y-2">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requestAi}
                  onChange={(e) => setRequestAi(e.target.checked)}
                  disabled={sending}
                  className="rounded"
                />
                <span className="text-muted-foreground">Request AI mediation</span>
              </label>
              <Button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
