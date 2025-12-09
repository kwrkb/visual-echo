-- Update get_tree_structure function to use ENUM type for status
-- ENUM型に対応するようにget_tree_structure関数を更新

-- Step 1: 既存の関数を削除
DROP FUNCTION IF EXISTS get_tree_structure(UUID);

-- Step 2: ENUM型を使用する新しい関数を作成
CREATE OR REPLACE FUNCTION get_tree_structure(root_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  image_url TEXT,
  prompt TEXT,
  created_at TIMESTAMPTZ,
  status generation_status,  -- TEXT から generation_status に変更
  depth INT,
  path TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree AS (
    -- Anchor member: Start with the specified root or all roots
    SELECT
      g.id,
      g.parent_id,
      g.image_url,
      g.prompt,
      g.created_at,
      g.status,
      0 AS depth,
      ARRAY[g.id::text] AS path
    FROM generations g
    WHERE
      (root_id IS NULL AND g.parent_id IS NULL) -- root_idがNULLなら全ルートを取得
      OR
      (root_id IS NOT NULL AND g.id = root_id) -- 指定されたIDから開始

    UNION ALL

    -- Recursive member: Find children
    SELECT
      g.id,
      g.parent_id,
      g.image_url,
      g.prompt,
      g.created_at,
      g.status,
      t.depth + 1,
      t.path || g.id::text
    FROM generations g
    JOIN tree t ON g.parent_id = t.id
  )
  SELECT
    tree.id,
    tree.parent_id,
    tree.image_url,
    tree.prompt,
    tree.created_at,
    tree.status,
    tree.depth,
    tree.path
  FROM tree
  ORDER BY path;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_tree_structure IS 'Recursive function to retrieve tree structure with ENUM status type';
