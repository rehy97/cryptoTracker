using System.Security.Claims;

namespace backend.Extensions
{
    public static class ClaimExtensions
    {
        public static string GetUsername(this ClaimsPrincipal claimsPrincipal)
        {
            // Retrieve the value of the claim for the given name
            var claim = claimsPrincipal.Claims.FirstOrDefault(x => x.Type.Equals("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"));

            // Check if the claim exists and return its value
            return claim?.Value;
        }
    }
}