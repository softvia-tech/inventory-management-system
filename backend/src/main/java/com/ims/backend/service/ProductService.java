package com.ims.backend.service;

import com.ims.backend.dto.*;

import java.util.List;
import java.util.UUID;

public interface ProductService {
    
    ProductResponse createProduct(ProductCreateRequest request);
    
    ProductResponse getProductByBarcode(String barcode);
    
    List<ProductListResponse> getAllProductsAndQuantities();
    
    ProductResponse updateProductDetails(UUID id, ProductUpdateRequest request);
    
    ProductResponse adjustStock(UUID id, StockAdjustmentRequest request);
}
