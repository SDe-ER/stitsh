import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { userId: 'test-123', email: 'test@test.com', role: 'ADMIN' },
  'heavyops_super_secret_jwt_key_2024',
  { expiresIn: '7d' }
)
console.log(token)
