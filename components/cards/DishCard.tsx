"use client"
import Image from "next/image"
import { AddToCart } from '@/lib/actions'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import React, { useState } from 'react'

interface DishSkeletonProps {}

function DishSkeleton({}: DishSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

interface DishCardProps {
  dish: any
  isLoggedIn: boolean
}

export default function DishCard({dish, isLoggedIn}: DishCardProps){

  const [loading, setLoading] = useState(false);

  const isOutOfStock = dish?.ingredients?.some(
    (ing: any) => ing.ingredient?.quantity < ing.quantity
  ) ?? false;

  const handleAddToCart = async () => {
    setLoading(true);

    try {
      await AddToCart(dish.slug);
    } finally {
      setLoading(false);
    }
  };

  if (!dish) {
    return <DishSkeleton />
  }

  return (
    <div className="group flex flex-col gap-3 p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          {dish.image && (
            <Image 
              src={dish.image} 
              alt={dish.name} 
              fill
              className="object-cover group-hover:scale-110 transition-transform" 
            />
          )}
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h2 className="font-semibold text-lg leading-tight truncate">{dish.name}</h2>
          <p className="text-xs text-muted-foreground capitalize">{dish.category}</p>
          {dish.description && (
            <p className="text-sm line-clamp-2">{dish.description}</p>
          )}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {dish.ingredients.slice(0, 3).map((ing: any, i: number) => (
                <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {ing.ingredient?.name}
                </span>
              ))}
              {dish.ingredients.length > 3 && (
                <span className="text-xs text-muted-foreground">+{dish.ingredients.length - 3}</span>
              )}
            </div>
          )}
          {dish.preparationTime && (
            <p className="text-xs text-muted-foreground">
              ⏱️ {dish.preparationTime} min
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-xl font-bold">
          {dish.price?.toFixed(2)} EUR
        </span>
        {isLoggedIn ? (
          <Button 
            size="sm" 
            onClick={handleAddToCart} 
            disabled={loading || isOutOfStock}
            variant={isOutOfStock ? "secondary" : "default"}
            className="min-w-[100px]"
          >
            {loading ? "Adding..." : isOutOfStock ? "Out of stock" : "Add to cart"}
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">Log in to order</span>
        )}
      </div>
    </div>
  )
}
