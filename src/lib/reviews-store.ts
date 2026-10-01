import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
};

// Reviews live in Supabase (table `reviews`): publicly readable once approved
// (or always visible to an admin session), publicly insertable but always
// starting unapproved, admin-only to approve/reject.

type ReviewRow = {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
};

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    date: row.date,
    approved: row.approved,
  };
}

const APPROVED_QUERY_KEY = (productId: string) => ["reviews", "approved", productId] as const;
const PENDING_QUERY_KEY = ["reviews", "pending"] as const;

export const reviewsStore = {
  async submit(
    productId: string,
    input: { name: string; rating: number; comment: string },
  ): Promise<void> {
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      name: input.name,
      rating: input.rating,
      comment: input.comment,
      approved: false,
    });
    if (error) throw error;
  },
  async approve(id: string): Promise<void> {
    const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
    if (error) throw error;
  },
  async reject(id: string): Promise<void> {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
  },
};

export function useApprovedReviews(productId: string): Review[] {
  const { data } = useQuery({
    queryKey: APPROVED_QUERY_KEY(productId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("approved", true)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as ReviewRow[] | null)?.map(rowToReview) ?? [];
    },
  });
  return data ?? [];
}

export function usePendingReviews(): Review[] {
  const { data } = useQuery({
    queryKey: PENDING_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", false)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as ReviewRow[] | null)?.map(rowToReview) ?? [];
    },
  });
  return data ?? [];
}

export function useInvalidateReviews() {
  const queryClient = useQueryClient();
  return (productId?: string) => {
    queryClient.invalidateQueries({ queryKey: PENDING_QUERY_KEY });
    if (productId) queryClient.invalidateQueries({ queryKey: APPROVED_QUERY_KEY(productId) });
    else queryClient.invalidateQueries({ queryKey: ["reviews", "approved"] });
  };
}

export function getReviewSummary(reviews: Review[]) {
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { average, count: reviews.length };
}
