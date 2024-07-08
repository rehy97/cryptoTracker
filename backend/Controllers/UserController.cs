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

        public UserController(AppDbContext context, ILogger<UserController> logger, UserManager<User> userManager, TokenService tokenService, SignInManager<User> signinManager)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signinManager;
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

                var user = new User
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    DateOfBirth = registerDto.DateOfBirth.ToUniversalTime()
                };

                var createdUser = await _userManager.CreateAsync(user, registerDto.Password);

                if(createdUser.Succeeded)
                {

                    var userRole = await _userManager.AddToRoleAsync(user, "User");

                    if(userRole.Succeeded)
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
                        Console.WriteLine("User role creation failed:");

                        foreach (var error in userRole.Errors)
                        {
                            Console.WriteLine($"{error.Code}: {error.Description}");
                        }

                        return StatusCode(500, userRole.Errors);
                    }
                }
                else
                {
                    Console.WriteLine("User creation failed:");

                    foreach (var error in createdUser.Errors)
                    {
                        Console.WriteLine($"{error.Code}: {error.Description}");
                    }

                    return StatusCode(500, createdUser.Errors.Select(e => e.Description));
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error registering user");

                Console.WriteLine("Error registering user:");

                Console.WriteLine(ex.Message);

                return StatusCode(500, ex.Message);
            }
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