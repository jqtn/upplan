import { cache } from "react";
import { createClient } from "./server-client";

const getUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Failed to get user data.");
  }

  return user;
};

export const getUserData = cache(getUser);
