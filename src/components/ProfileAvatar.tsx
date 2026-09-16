interface ProfileAvatarProps {
  name: string;
  color: string;
  size?: number;
}

export default function ProfileAvatar({ name, color, size = 56 }: ProfileAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shadow-md select-none"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
