from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.db import get_db
from api.models.asset import Asset
from api.schemas.asset import AssetCreate, AssetUpdate, AssetResponse

router = APIRouter(prefix="/api/v1/assets", tags=["Assets"])

@router.get("", response_model=List[AssetResponse])
async def list_assets(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all registered industrial assets"""
    result = await db.execute(select(Asset).offset(skip).limit(limit).order_by(Asset.id.asc()))
    assets = result.scalars().all()
    return assets

@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    asset_in: AssetCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new industrial plant asset"""
    asset = Asset(**asset_in.model_dump())
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve asset details by ID"""
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID {asset_id} not found"
        )
    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: int,
    asset_in: AssetUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update asset metadata and consequence score"""
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID {asset_id} not found"
        )
    
    update_data = asset_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
        
    await db.commit()
    await db.refresh(asset)
    return asset

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete asset by ID"""
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID {asset_id} not found"
        )
    await db.delete(asset)
    await db.commit()
    return None
