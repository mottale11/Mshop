-- Update Trigger to Handle ALL Status Changes
create or replace function public.handle_order_status_change()
returns trigger as $$
declare
  _title text;
  _message text;
  _link text;
begin
  -- Check if status has changed
  if new.status is distinct from old.status then
    
    _link := '/account/orders?orderId=' || new.id;

    if new.status = 'Delivered' then
      _title := 'Order Delivered';
      _message := 'Your order ' || substring(new.id::text from 1 for 8) || ' has been delivered. Please rate and review your items!';
    else
      _title := 'Order Update';
      _message := 'Your order ' || substring(new.id::text from 1 for 8) || ' is now ' || new.status || '.';
    end if;

    insert into public.notifications (user_id, type, title, message, link)
    values (
      new.user_id,
      'order',
      _title,
      _message,
      _link
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;
