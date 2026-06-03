package com.ims.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "product_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "barcode", unique = true, length = 100)
    private String barcode;

    @Column(name = "product_name", nullable = false, length = 150)
    private String name;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "brand", length = 100)
    private String brand;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "jsonb")
    private Map<String, String> attributes;

    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "profit_percentage", precision = 5, scale = 2)
    private BigDecimal profitPercentage;

    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime updatedAt;

    @Column(name = "is_synced")
    private Boolean isSynced;

    @PrePersist
    @PreUpdate
    public void calculateSellingPrice() {
        if (costPrice != null) {
            BigDecimal profit = profitPercentage != null ? profitPercentage : BigDecimal.ZERO;
            this.sellingPrice = costPrice.multiply(BigDecimal.ONE.add(profit.divide(BigDecimal.valueOf(100))));
        }
        if (currentStock == null) {
            currentStock = 0;
        }
        if (isSynced == null) {
            isSynced = false;
        }
    }
}
