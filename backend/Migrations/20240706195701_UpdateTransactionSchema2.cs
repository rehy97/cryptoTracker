using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTransactionSchema2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transactions_UserId_CryptocurrencyId",
                table: "Transactions");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "18f8d4fb-17f6-404a-9cf1-14f454146a67");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "f1367a7e-f225-4251-a1b9-c2d38211090f");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "3efdedf2-b6aa-4caa-a3d3-e999c19204df", null, "Admin", "ADMIN" },
                    { "b10173e1-de47-48a3-9464-6d8b266bd970", null, "User", "USER" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserId",
                table: "Transactions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transactions_UserId",
                table: "Transactions");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "3efdedf2-b6aa-4caa-a3d3-e999c19204df");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "b10173e1-de47-48a3-9464-6d8b266bd970");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "18f8d4fb-17f6-404a-9cf1-14f454146a67", null, "Admin", "ADMIN" },
                    { "f1367a7e-f225-4251-a1b9-c2d38211090f", null, "User", "USER" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserId_CryptocurrencyId",
                table: "Transactions",
                columns: new[] { "UserId", "CryptocurrencyId" },
                unique: true);
        }
    }
}
