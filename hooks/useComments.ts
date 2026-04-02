"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/SupabaseProvider";

export interface Comment {
  id: string;
  user_id: string;
  case_id: string;
  target_id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_color: string;
}

export function useComments(caseId: string, targetId: string | null) {
  const { user } = useAuth();
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetId || !caseId) {
      setComments([]);
      return;
    }

    setLoading(true);
    supabase
      .from("comments")
      .select("*, profiles(name, avatar_color)")
      .eq("case_id", caseId)
      .eq("target_id", targetId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) return;
        setComments(
          data.map((row) => {
            const p = row.profiles as { name: string; avatar_color: string } | null;
            return {
              id: row.id,
              user_id: row.user_id,
              case_id: row.case_id,
              target_id: row.target_id,
              content: row.content,
              created_at: row.created_at,
              author_name: p?.name || "Investigator",
              author_color: p?.avatar_color || "#4A6A9A",
            };
          })
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, targetId]);

  const addComment = useCallback(
    async (content: string) => {
      if (!user || !caseId || !targetId || !content.trim()) return;

      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          case_id: caseId,
          target_id: targetId,
          content: content.trim(),
        })
        .select("*, profiles(name, avatar_color)")
        .single();

      if (!error && data) {
        const p = data.profiles as { name: string; avatar_color: string } | null;
        setComments((prev) => [
          ...prev,
          {
            id: data.id,
            user_id: data.user_id,
            case_id: data.case_id,
            target_id: data.target_id,
            content: data.content,
            created_at: data.created_at,
            author_name: p?.name || "Investigator",
            author_color: p?.avatar_color || "#4A6A9A",
          },
        ]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, caseId, targetId]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (!error) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  return { comments, loading, addComment, deleteComment };
}
