using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.models;
using backend.db;
using backend.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using backend.Services;
using Microsoft.Extensions.Caching.Memory;
using System.Web;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;
        private readonly ILogger<UserController> _logger;
        private readonly SignInManager<User> _signInManager;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;

        public UserController(AppDbContext context, ILogger<UserController> logger, UserManager<User> userManager, TokenService tokenService, SignInManager<User> signinManager, IEmailService emailService, IMemoryCache cache, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signinManager;
            _emailService = emailService;
            _cache = cache;
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _context.Users.ToList();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var user = _context.Users.Find(id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if(!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await _userManager.Users.FirstOrDefaultAsync(u => u.UserName == loginDto.Username.ToLower());

                if(user == null)
                {
                    return Unauthorized("Invalid username");
                }

                var passwordCheck = await _userManager.CheckPasswordAsync(user, loginDto.Password);

                if(passwordCheck)
                {
                    return Ok(
                        new NewUserDto
                        {
                            Username = user.UserName,
                            Email = user.Email,
                            Token = _tokenService.CreateToken(user)
                        }
                    );
                }
                else
                {
                    return Unauthorized("Username or password is incorrent");
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error logging in user");
                return StatusCode(500, ex.Message);
            }
        }

         [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try 
            {
                if(!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                Console.WriteLine("Registering user");

                // CAPTCHA verification
                if (!await VerifyCaptchaAsync(registerDto.CaptchaToken))
                {
                    return BadRequest("CAPTCHA verification failed.");
                }

                var user = new User
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    DateOfBirth = registerDto.DateOfBirth.ToUniversalTime(),
                    EmailConfirmed = false
                };

                var createdUser = await _userManager.CreateAsync(user, registerDto.Password);

                if(createdUser.Succeeded)
                {
                    var userRole = await _userManager.AddToRoleAsync(user, "User");

                    if(userRole.Succeeded)
                    {
                        // Generate email confirmation token
                        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        Console.WriteLine($"Token: {token}");
                        var encodedToken = HttpUtility.UrlEncode(token);
                        Console.WriteLine($"Encoded Token: {encodedToken}");
                        var confirmationLink = Url.Action("ConfirmEmail", "User", 
                            new { userId = user.Id, token = encodedToken }, Request.Scheme);

                        Console.WriteLine($"Confirmation link: {confirmationLink}");

                        // Check if we can send an email to this address
                        if (await CanSendEmail(user.Email))
                        {
                            // Send confirmation email
                            await _emailService.SendEmailAsync(user.Email, "Confirm your email",
                                $"Please confirm your account by clicking this link: <a href='{confirmationLink}'>link</a>");

                            return Ok(new { message = "User created successfully. Please check your email to confirm your account." });
                        }
                        else
                        {
                            _logger.LogWarning($"Email sending limit reached for {user.Email}");
                            return Ok(new { message = "User created successfully. However, we couldn't send a confirmation email at this time. Please try again later." });
                        }
                    }
                    else
                    {
                        return StatusCode(500, userRole.Errors);
                    }
                }
                else
                {
                    return StatusCode(500, createdUser.Errors.Select(e => e.Description));
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error registering user");
                return StatusCode(500, ex.Message);
            }
        }

        private async Task<bool> VerifyCaptchaAsync(string token)
        {
            using var client = new HttpClient();
            var response = await client.PostAsync(
                $"https://www.google.com/recaptcha/api/siteverify?secret={_configuration["ReCaptcha:SecretKey"]}&response={token}",
                null
            );
            var result = await response.Content.ReadFromJsonAsync<CaptchaResponse>();
            return result.Success;
        }

        private async Task<bool> CanSendEmail(string email)
        {
            string cacheKey = $"EmailSent_{email}";
            if (!_cache.TryGetValue(cacheKey, out int emailsSent))
            {
                emailsSent = 0;
            }

            if (emailsSent >= 3) // Limit to 3 emails per hour
            {
                return false;
            }

            emailsSent++;
            _cache.Set(cacheKey, emailsSent, TimeSpan.FromHours(1));
            return true;
        }

    public class CaptchaResponse
    {
        public bool Success { get; set; }
        // Add other properties as needed
    }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var user = _context.Users.Find(id);

            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            _context.SaveChanges();

            return NoContent();
        }
    }
}