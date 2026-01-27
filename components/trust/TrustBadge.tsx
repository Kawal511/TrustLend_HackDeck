// components/trust/TrustBadge.tsx - Trust score badge display

import { cn } from "@/lib/utils";
import { getTrustTier } from "@/lib/trust";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Award, Crown, Gem } from "lucide-react";

interface TrustBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

const tierIcons = {
    Bronze: Shield,
    Silver: Star,
    Gold: Award,
    Platinum: Crown,
    Diamond: Gem
};

export function TrustBadge({ score, size = "md", showLabel = true }: TrustBadgeProps) {
    const tier = getTrustTier(score);
    const Icon = tierIcons[tier.name as keyof typeof tierIcons];

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5"
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5"
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium gap-1.5 border",
                tier.bgColor,
                tier.color,
                sizeClasses[size]
            )}
        >
            <Icon className={iconSizes[size]} />
            {showLabel && <span>{tier.name}</span>}
            <span className="font-bold">{score}</span>
        </Badge>
    );
}
