import { motion } from "framer-motion";
import { useChat } from '@ai-sdk/react';
import { BotIcon, SendIcon, UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";


function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: import.meta.env.VITE_API_URL,
    maxSteps: 5
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const presetQuestions = [
    "Find me a good vlogging camera for next weekend",
    "Do you have any drones that I can rent?",
    "I need a PS5 on rent"
  ];

  const handleQuestionClick = (question: string) => {
    setInput(question);
    // Create a synthetic form event
    const formEvent = new Event('submit', { bubbles: true }) as unknown as React.FormEvent<HTMLFormElement>;
    handleSubmit(formEvent);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-3xl mx-auto">
      <main className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 p-4 pt-4 overflow-y-auto">
            <div className="space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="space-y-6">
                  <motion.div
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
                      <BotIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        👋 Hi! I'm your rental assistant. I can help you find and rent various items like cameras, drones, gaming consoles, and more. What are you looking to rent today?
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {presetQuestions.map((question, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={() => handleQuestionClick(question)}
                          >
                            {question}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                messages.map(message => (
                  <MessagePreview 
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    toolInvocations={message.toolInvocations} 
                  />
                ))
              )}
            </div>
          </CardContent>

          <div className="border-t p-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Textarea
                placeholder="Send a message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                name="prompt"
                className="min-h-0 h-10 focus-visible:ring-0 resize-none py-2"
              />
              <Button size="icon" type="submit">
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}

const MessagePreview = ({
  role,
  content,
  toolInvocations,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<any> | undefined;
}) => {
  const isUser = role === "user";

  return (
    <motion.div
      className="group relative flex items-start gap-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
          <BotIcon className="h-4 w-4" />
        </div>
      )}
      
      <div className="flex flex-col gap-2 flex-1">
        {content && typeof content === "string" && (
          <div className={`rounded-lg px-4 py-2 max-w-[85%] ${
            isUser 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-muted"
          }`}>
            {content}
          </div>
        )}

        {toolInvocations && (
          <div className="w-full space-y-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;
                return (
                  <div key={toolCallId}>
                    {toolName === "searchItems" ? (
                      <ItemsList result={result} />
                    ) : null}
                  </div>
                );
              }
              
              return (
                <div key={toolCallId} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
};

const ItemsList = ({ result = [] }) => {
  if (!result.length) return null;
  
  return (
    <div className="grid gap-4">
      {result.map((item: any) => {
        const { id = '', image_url = '', deposit = 0, price_per_day = 0, description = '', name = '' } = item;

        return (
          <Card key={id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              <div className="w-full sm:w-auto">
                <img 
                  className="w-full sm:w-32 sm:h-32 rounded-lg object-cover border aspect-video sm:aspect-square"
                  src={image_url}
                  alt={name}
                />
              </div>
              <div className="flex flex-col flex-1 gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Price:</span>
                      <span className="font-bold text-lg">₹{price_per_day}/day</span>
                    </div>
                    <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      Deposit: ₹{deposit}
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-medium px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    onClick={() => alert('Reservation feature coming soon!')}
                  >
                    Reserve Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default Chat;