-- Create a function to delete the current user's account
-- This function can only be called by authenticated users and will delete their own account

CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  result json;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RETURN json_build_object('error', 'User not authenticated');
  END IF;
  
  -- Delete user data (this should already be done in the client, but let's be thorough)
  DELETE FROM memories WHERE user_id = auth.uid();
  DELETE FROM wellness_metrics WHERE user_id = auth.uid();
  DELETE FROM wellness_goals WHERE user_id = auth.uid();
  
  -- Delete the user from auth.users (this requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = user_id;
  
  -- Return success
  result := json_build_object('success', true, 'message', 'User account deleted successfully');
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error if something goes wrong
    RETURN json_build_object('error', 'Failed to delete user account: ' || SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account and all associated data';
