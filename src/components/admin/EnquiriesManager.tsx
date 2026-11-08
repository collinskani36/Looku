import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  enquiry_type: string;
  message: string;
  handled: boolean;
  created_at: string;
};

const KEY = ["enquiries"] as const;

export function EnquiriesManager() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Enquiry[];
    },
  });

  async function toggleHandled(item: Enquiry) {
    const { error } = await supabase.from("enquiries").update({ handled: !item.handled }).eq("id", item.id);
    if (error) alert(error.message);
    else await queryClient.invalidateQueries({ queryKey: KEY });
  }

  async function remove(item: Enquiry) {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("enquiries").delete().eq("id", item.id);
    if (error) alert(error.message);
    else await queryClient.invalidateQueries({ queryKey: KEY });
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading enquiries…</p>;
  if (error) return <p className="text-sm text-destructive">Could not load enquiries: {error.message}</p>;
  if (!data?.length) return <p className="text-sm text-muted-foreground">No enquiries yet.</p>;

  return (
    <ul className="space-y-4">
      {data.map((item) => (
        <li key={item.id} className={`border border-border bg-card p-5 ${item.handled ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="editorial-heading text-2xl">{item.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.enquiry_type} · {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
            <span className={`text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${item.handled ? "text-muted-foreground" : "text-gold"}`}>
              {item.handled ? "Handled" : "New"}
            </span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{item.message}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a className="underline decoration-gold underline-offset-4" href={`mailto:${item.email}`}>{item.email}</a>
            <a className="underline decoration-gold underline-offset-4" href={`tel:${item.phone}`}>{item.phone}</a>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={() => toggleHandled(item)}>
              {item.handled ? "Mark as new" : "Mark as handled"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-none text-destructive" onClick={() => remove(item)}>
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
