package com.ims.backend.repository;

import com.ims.backend.entity.SalesTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SalesTransactionRepository extends JpaRepository<SalesTransaction, UUID> {
}
