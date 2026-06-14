# Next Steps

Upcoming phases and development recommendations for the TEDI platform.

## Proposed Path

1. **Authentication & Authorization**:
   - Integrate JWT authentication or Django session auth.
   - Design login and register screens in Next.js.
2. **Database Models & API Resource design**:
   - Establish core models (e.g. users, products/courses, payments, etc.).
   - Define serializers and viewsets using DRF.
3. **Frontend Integration**:
   - Set up API client wrappers (Axios or fetch utilities).
   - Create route guards for public vs protected dashboard views.
4. **Testing Setup**:
   - Introduce pytest for backend tests.
   - Configure Jest or Vitest for frontend test components.
