export default function SiteManagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="site-manage__placeholder">
      <h2 className="site-manage__placeholder-title">{title}</h2>
      <p className="site-manage__placeholder-text">{description}</p>
    </div>
  );
}
