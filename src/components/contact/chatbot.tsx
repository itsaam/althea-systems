"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // TODO: Implement chatbot logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistance en ligne</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-auto mb-4 space-y-2">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-center">
              Posez-nous vos questions !
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              } max-w-[80%]`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>Envoyer</Button>
        </div>
      </CardContent>
    </Card>
  );
}
