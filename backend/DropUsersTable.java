import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DropUsersTable {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/shop_inventory";
        String user = "postgres";
        String password = "password"; // Using standard local defaults, or postgres

        try (Connection conn = DriverManager.getConnection(url, "postgres", "root");
             Statement stmt = conn.createStatement()) {
            stmt.execute("DROP TABLE IF EXISTS users CASCADE;");
            System.out.println("SUCCESS: users table dropped.");
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
        }
    }
}
