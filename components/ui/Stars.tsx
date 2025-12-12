import { Star } from "lucide-react";
import { FC } from "react";

type StarsProps = {
  value: number | null;
  color: string;
};

function pctToStars(value: number | null): number {
  if (value == null || Number.isNaN(value)) return 0;

  // 0–100% → 1–5 estrellas
  return Math.max(1, Math.min(5, Math.round(value / 20)));
}

const Stars: FC<StarsProps> = ({ value, color }) => {
  const stars = pctToStars(value);

  return (
    <div className="mt-2 flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={18}
          className={i < stars ? "fill-current" : "stroke-slate-300"}
          style={i < stars ? { color } : undefined}
        />
      ))}
      {value != null && (
        <span className="ml-2 text-xs text-slate-500">({stars}/5)</span>
      )}
    </div>
  );
};

export default Stars;
