-- Create policy for admins to UPDATE bookings if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'bookings' 
      AND policyname = 'Admins can update all bookings'
  ) THEN
    CREATE POLICY "Admins can update all bookings"
    ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Storage policies for private bucket 'payout-proofs'
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Admins can upload payout proofs'
  ) THEN
    CREATE POLICY "Admins can upload payout proofs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'payout-proofs'
      AND public.has_role(auth.uid(), 'admin')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Admins can view payout proofs'
  ) THEN
    CREATE POLICY "Admins can view payout proofs"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'payout-proofs'
      AND public.has_role(auth.uid(), 'admin')
    );
  END IF;
END $$;