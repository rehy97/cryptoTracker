using System.ComponentModel.DataAnnotations;

public class RegisterDto
{
    [Required]
    public string? Username { get; set; }
    [Required]
    public string? FirstName { get; set; }

    [Required]
    public string? LastName { get; set; }

    [Required]
    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    public string? Password { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    public string CaptchaToken { get; set; }
}