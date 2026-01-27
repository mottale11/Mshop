-- Create Function to Recalculate Ratings
create or replace function public.update_product_rating()
returns trigger as $$
declare
  _product_id uuid;
  _avg_rating numeric;
  _count integer;
begin
  -- Determine product_id based on operation
  if (TG_OP = 'DELETE') then
    _product_id := OLD.product_id;
  else
    _product_id := NEW.product_id;
  end if;

  -- Calculate stats
  select coalesce(avg(rating), 0), count(*)
  into _avg_rating, _count
  from public.reviews
  where product_id = _product_id;

  -- Update products table
  update public.products
  set 
    rating = round(_avg_rating, 1),
    reviews_count = _count
  where id = _product_id;

  return null;
end;
$$ language plpgsql security definer;

-- Create Trigger
drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update of rating or delete on public.reviews
  for each row execute procedure public.update_product_rating();
