using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class CoinRefreshService : IHostedService, IDisposable
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<CoinRefreshService> _logger;
        private Timer _timer;
        private const int RefreshIntervalSeconds = 20;

        public CoinRefreshService(IServiceProvider services, ILogger<CoinRefreshService> logger)
        {
            _services = services;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Coin Refresh Service is starting.");

            _timer = new Timer(DoWork, null, TimeSpan.Zero, 
                TimeSpan.FromSeconds(RefreshIntervalSeconds));

            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            _logger.LogInformation("Coin Refresh Service is working.");

            using (var scope = _services.CreateScope())
            {
                var coinService = 
                    scope.ServiceProvider
                        .GetRequiredService<CoinService>();

                _ = coinService.FetchAndCacheCoins("usd").ConfigureAwait(false);
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Coin Refresh Service is stopping.");

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}