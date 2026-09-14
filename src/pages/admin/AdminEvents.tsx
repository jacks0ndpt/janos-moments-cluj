import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const EVENT_TYPES = ["Wedding", "Baptism", "Civil ceremony", "Other"] as const;

type EventRow = {
  id: string;
  name: string;
  location: string | null;
  event_type: string;
  other_event_type: string | null;
  price: number | null;
  event_date: string | null;
  created_at: string;
};

const emptyForm = {
  name: "",
  location: "",
  event_type: "Wedding",
  other_event_type: "",
  price: "",
  event_date: "",
};

const SORT_OPTIONS = [
  { value: "dateNewest", label: "Date newest first" },
  { value: "dateOldest", label: "Date oldest first" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
] as const;

export default function AdminEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("dateNewest");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load events", description: error.message, variant: "destructive" });
    } else {
      setEvents((data ?? []) as unknown as EventRow[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      location: form.location.trim() || null,
      event_type: form.event_type,
      other_event_type: form.event_type === "Other" ? form.other_event_type.trim() || null : null,
      price: form.price.trim() === "" ? null : Number(form.price),
      event_date: form.event_date.trim() === "" ? null : form.event_date.trim(),
    };
    const { error } = editingId
      ? await supabase.from("events").update(payload).eq("id", editingId)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save event", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Event updated" : "Event added" });
    resetForm();
    load();
  };

  const handleEdit = (ev: EventRow) => {
    setEditingId(ev.id);
    setForm({
      name: ev.name,
      location: ev.location ?? "",
      event_type: EVENT_TYPES.includes(ev.event_type as (typeof EVENT_TYPES)[number])
        ? ev.event_type
        : "Other",
      other_event_type: ev.other_event_type ?? "",
      price: ev.price === null ? "" : String(ev.price),
      event_date: ev.event_date ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (ev: EventRow) => {
    if (!window.confirm(`Delete "${ev.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("events").delete().eq("id", ev.id);
    if (error) {
      toast({ title: "Could not delete event", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Event deleted" });
    if (editingId === ev.id) resetForm();
    load();
  };

  const typeLabel = (ev: EventRow) =>
    ev.event_type === "Other" && ev.other_event_type
      ? ev.other_event_type
      : ev.event_type;

  const formatEventDate = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const filteredEvents = useMemo(() => {
    const filtered =
      filterType === "All"
        ? events
        : events.filter((ev) => ev.event_type === filterType);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "dateNewest": {
          if (!a.event_date && !b.event_date) return 0;
          if (!a.event_date) return 1;
          if (!b.event_date) return -1;
          return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
        }
        case "dateOldest": {
          if (!a.event_date && !b.event_date) return 0;
          if (!a.event_date) return 1;
          if (!b.event_date) return -1;
          return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        }
        case "name":
          return a.name.localeCompare(b.name);
        case "price": {
          const ap = a.price ?? Infinity;
          const bp = b.price ?? Infinity;
          return ap - bp;
        }
        default:
          return 0;
      }
    });
  }, [events, filterType, sortBy]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Events</h1>

      {/* Add / Edit form */}
      <form onSubmit={handleSubmit} className="border rounded-lg p-4 md:p-6 space-y-4 bg-card">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {editingId ? "Edit Event" : "Add Event"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ev-name">Name</Label>
            <Input
              id="ev-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Andreea & Mihai"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-location">Location</Label>
            <Input
              id="ev-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Cluj-Napoca"
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={form.event_type}
              onValueChange={(v) => setForm({ ...form, event_type: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.event_type === "Other" && (
            <div className="space-y-1.5">
              <Label htmlFor="ev-other">Custom type</Label>
              <Input
                id="ev-other"
                value={form.other_event_type}
                onChange={(e) => setForm({ ...form, other_event_type: e.target.value })}
                placeholder="e.g. Anniversary"
                className="w-full"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="ev-price">Price</Label>
            <Input
              id="ev-price"
              type="number"
              min="0"
              step="any"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="700"
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-date">Event date</Label>
            <Input
              id="ev-date"
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add Event"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Saved events
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Filter</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Sort</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <ul className="divide-y border rounded-lg overflow-hidden">
            {filteredEvents.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 bg-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{ev.name}</div>
                  <div className="text-sm text-muted-foreground break-words">
                    {ev.location || "—"} · {typeLabel(ev)}
                    {ev.event_date && ` · ${formatEventDate(ev.event_date)}`}
                    {ev.price !== null && ` · ${ev.price}€`}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(ev)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
