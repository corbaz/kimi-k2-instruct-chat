import { Activity, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StreamingStatsProps {
  tokens: number;
  elapsed: string;
  tokensPerSecond: string;
  isComplete?: boolean;
}

export function StreamingStats({ tokens, elapsed, tokensPerSecond, isComplete }: StreamingStatsProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
      <Badge variant="outline" className="text-xs px-2 py-0.5 gap-1">
        <Activity className="w-3 h-3" />
        {tokens} tokens
      </Badge>
      
      <Badge variant="outline" className="text-xs px-2 py-0.5 gap-1">
        <Clock className="w-3 h-3" />
        {elapsed}s
      </Badge>
      
      <Badge 
        variant="outline" 
        className={`text-xs px-2 py-0.5 gap-1 ${
          isComplete ? 'bg-green-50 border-green-200 text-green-700' : 'bg-primary/10 border-primary/20 text-primary'
        }`}
      >
        <Zap className="w-3 h-3" />
        {tokensPerSecond} t/s
      </Badge>
      
      {!isComplete && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
          <span className="text-primary">streaming...</span>
        </div>
      )}
    </div>
  );
}