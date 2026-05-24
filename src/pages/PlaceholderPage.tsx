type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-blue-600">{title}</p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>

      <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center">
        <p className="text-sm font-medium text-slate-500">
          We will build this page in the next phases.
        </p>
      </div>
    </div>
  );
}