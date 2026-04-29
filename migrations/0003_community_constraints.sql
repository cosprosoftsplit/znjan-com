-- Deduplicate join responses before enforcing uniqueness
DELETE FROM responses
WHERE type = 'join'
  AND id NOT IN (
    SELECT MIN(id)
    FROM responses
    WHERE type = 'join'
    GROUP BY post_id, user_id, type
  );

-- Deduplicate action/reference rewards before enforcing idempotency
DELETE FROM point_transactions
WHERE reference_id IS NOT NULL
  AND id NOT IN (
    SELECT MIN(id)
    FROM point_transactions
    WHERE reference_id IS NOT NULL
    GROUP BY user_id, action, reference_id
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_unique_join
ON responses(post_id, user_id, type)
WHERE type = 'join';

CREATE UNIQUE INDEX IF NOT EXISTS idx_point_transactions_unique_action_reference
ON point_transactions(user_id, action, reference_id)
WHERE reference_id IS NOT NULL;
