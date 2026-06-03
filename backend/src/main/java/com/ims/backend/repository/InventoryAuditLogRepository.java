package com.ims.backend.repository;

import com.ims.backend.entity.InventoryAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryAuditLogRepository extends JpaRepository<InventoryAuditLog, UUID> {
}
