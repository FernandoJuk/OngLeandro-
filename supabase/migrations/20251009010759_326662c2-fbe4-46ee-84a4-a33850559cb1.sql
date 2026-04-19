-- Add public read policy for favorites table to avoid 406 errors
CREATE POLICY "Anyone can view favorites"
ON public.favorites
FOR SELECT
USING (true);