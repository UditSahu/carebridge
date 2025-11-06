interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

const SectionHeader = ({ label, title, description, align = "left" }: SectionHeaderProps) => {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : ""}`}>
      {label && (
        <span className="inline-block text-sm font-medium text-secondary mb-3 uppercase tracking-wider">
          {label}
        </span>
      )}
      <h2 className="text-4xl font-semibold text-foreground mb-4">{title}</h2>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
      )}
    </div>
  );
};

export default SectionHeader;
