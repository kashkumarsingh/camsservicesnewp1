'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePackages } from '@/interfaces/web/hooks/packages/usePackages';
import { PackageSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { CheckCircle, XCircle, Clock, Calendar, Activity, Users, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import BookingButtonWithChildId from '@/components/features/packages/BookingButtonWithChildId';

// Normalize similar features (e.g., "Small group sizes" = "Smaller group sizes")
const normalizeFeature = (feature: string): string => {
  return feature
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^(small|smaller|smallest)\s+group\s+sizes?$/i, 'small group sizes')
    .replace(/^(extended|longer|more)\s+support\s+hours?$/i, 'extended support hours')
    .replace(/^(wider|more|diverse|broader)\s+range\s+of\s+activities?$/i, 'diverse activities')
    .replace(/^(regular|frequent|ongoing)\s+progress\s+updates?$/i, 'progress tracking')
    .trim();
};

const PackageComparisonTable = () => {
  const { packages, loading, error } = usePackages({
    sortBy: 'price',
    sortOrder: 'asc',
  });
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // Calculate best value (lowest price per hour)
  const bestValuePackageId = useMemo(() => {
    if (packages.length === 0) return null;
    return packages.reduce((best, pkg) => {
      const bestValue = best.price / best.hours;
      const currentValue = pkg.price / pkg.hours;
      return currentValue < bestValue ? pkg : best;
    }).id;
  }, [packages]);

  // Expand inherited features (e.g., "All Mars features" -> actual Mars features)
  const expandInheritedFeatures = useMemo(() => {
    if (packages.length === 0) return new Map();
    
    const expandedFeatures = new Map<string, string[]>();
    
    packages.forEach(pkg => {
      const expanded: string[] = [];
      const processed = new Set<string>();
      
      (pkg.features ?? []).forEach(feature => {
        // Check if this is an inherited feature (e.g., "All Mars features")
        const inheritedMatch = feature.match(/^all\s+(\w+)\s+features?$/i);
        if (inheritedMatch) {
          const sourcePackageName = inheritedMatch[1];
          const sourcePackage = packages.find(p => 
            p.name.toLowerCase() === sourcePackageName.toLowerCase()
          );
          
          if (sourcePackage) {
            // Recursively expand source package features
            const sourceFeatures = expandedFeatures.get(sourcePackage.id) || 
              expandPackageFeatures(sourcePackage, packages, expandedFeatures);
            sourceFeatures.forEach((f: string) => {
              if (!processed.has(f.toLowerCase())) {
                expanded.push(f);
                processed.add(f.toLowerCase());
              }
            });
          }
        } else {
          // Regular feature
          if (!processed.has(feature.toLowerCase())) {
            expanded.push(feature);
            processed.add(feature.toLowerCase());
          }
        }
      });
      
      expandedFeatures.set(pkg.id, expanded);
    });
    
    return expandedFeatures;
  }, [packages]);
  
  // Helper function to recursively expand package features
  const expandPackageFeatures = (
    pkg: typeof packages[0],
    allPackages: typeof packages,
    cache: Map<string, string[]>
  ): string[] => {
    if (cache.has(pkg.id)) {
      return cache.get(pkg.id)!;
    }
    
    const expanded: string[] = [];
    const processed = new Set<string>();
    
    (pkg.features ?? []).forEach(feature => {
      const inheritedMatch = feature.match(/^all\s+(\w+)\s+features?$/i);
      if (inheritedMatch) {
        const sourcePackageName = inheritedMatch[1];
        const sourcePackage = allPackages.find(p => 
          p.name.toLowerCase() === sourcePackageName.toLowerCase()
        );
        
        if (sourcePackage) {
          const sourceFeatures = expandPackageFeatures(sourcePackage, allPackages, cache);
          sourceFeatures.forEach((f: string) => {
            if (!processed.has(f.toLowerCase())) {
              expanded.push(f);
              processed.add(f.toLowerCase());
            }
          });
        }
      } else {
        if (!processed.has(feature.toLowerCase())) {
          expanded.push(feature);
          processed.add(feature.toLowerCase());
        }
      }
    });
    
    cache.set(pkg.id, expanded);
    return expanded;
  };

  // Intelligent feature comparison - only show differentiating features
  const intelligentFeatures = useMemo(() => {
    if (packages.length === 0) return [];
    
    // Use expanded features instead of raw features
    const allFeatures = Array.from(expandInheritedFeatures.values()).flat();
    
    // Group similar features
    const featureGroups = new Map<string, Set<string>>();
    allFeatures.forEach(feature => {
      const normalized = normalizeFeature(feature);
      if (!featureGroups.has(normalized)) {
        featureGroups.set(normalized, new Set());
      }
      featureGroups.get(normalized)!.add(feature);
    });

    // Find features that differ between packages (not all packages have them)
    const differentiatingFeatures: Array<{ normalized: string; original: string; packages: Set<string> }> = [];
    
    featureGroups.forEach((originalVariants, normalized) => {
      const packagesWithFeature = new Set<string>();
      packages.forEach(pkg => {
        const pkgExpandedFeatures = expandInheritedFeatures.get(pkg.id) || [];
        const hasFeature = pkgExpandedFeatures.some((f: string) => 
          originalVariants.has(f) || normalizeFeature(f) === normalized
        );
        if (hasFeature) {
          packagesWithFeature.add(pkg.id);
        }
      });

      // Only include if not all packages have it (differentiating)
      if (packagesWithFeature.size > 0 && packagesWithFeature.size < packages.length) {
        // Use the most common variant as the display name
        const original = Array.from(originalVariants)[0];
        differentiatingFeatures.push({
          normalized,
          original,
          packages: packagesWithFeature,
        });
      }
    });

    // Sort by how many packages have it (most common first)
    return differentiatingFeatures.sort((a, b) => b.packages.size - a.packages.size);
  }, [packages, expandInheritedFeatures]);

  // Get unique features per package (what makes each package special)
  const uniqueFeaturesPerPackage = useMemo(() => {
    if (packages.length === 0) return [];
    return packages.map(pkg => {
      const pkgFeatures = (pkg.features ?? []).map(f => normalizeFeature(f));
      const otherPackagesFeatures = packages
        .filter(p => p.id !== pkg.id)
        .flatMap(p => (p.features ?? []).map(f => normalizeFeature(f)));
      
      return {
        packageId: pkg.id,
        uniqueFeatures: pkgFeatures.filter(f => !otherPackagesFeatures.includes(f)),
      };
    });
  }, [packages]);

  // NOW we can do early returns after all hooks are called
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-500 mb-6 uppercase tracking-wide">Loading package comparison</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PackageSkeleton count={Math.min(SKELETON_COUNTS.PACKAGES, 3)} />
        </div>
      </div>
    );
  }

  if (error || packages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-center">
        <p className="text-gray-600">
          {error
            ? 'We were unable to load the latest package data. Please try again shortly.'
            : 'Packages will appear here as soon as they are published.'}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-500 mb-6 uppercase tracking-wide">Loading package comparison</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PackageSkeleton count={Math.min(SKELETON_COUNTS.PACKAGES, 3)} />
        </div>
      </div>
    );
  }

  if (error || packages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-center">
        <p className="text-gray-600">
          {error
            ? 'We were unable to load the latest package data. Please try again shortly.'
            : 'Packages will appear here as soon as they are published.'}
        </p>
      </div>
    );
  }

  // Comparison rows for key decision factors
  const comparisonRows = [
    {
      label: 'Price',
      icon: TrendingUp,
      getValue: (pkg: typeof packages[0]) => `£${pkg.price}`,
      highlight: (pkg: typeof packages[0]) => pkg.price === Math.min(...packages.map(p => p.price)),
    },
    {
      label: 'Total Hours',
      icon: Clock,
      getValue: (pkg: typeof packages[0]) => `${pkg.hours}h`,
      highlight: (pkg: typeof packages[0]) => pkg.hours === Math.max(...packages.map(p => p.hours)),
    },
    {
      label: 'Price per Hour',
      icon: Star,
      getValue: (pkg: typeof packages[0]) => `£${(pkg.price / pkg.hours).toFixed(0)}`,
      highlight: (pkg: typeof packages[0]) => pkg.id === bestValuePackageId,
      badge: (pkg: typeof packages[0]) => pkg.id === bestValuePackageId ? 'Best Value' : null,
    },
    {
      label: 'Duration',
      icon: Calendar,
      getValue: (pkg: typeof packages[0]) => pkg.totalWeeks ? `${pkg.totalWeeks} ${pkg.totalWeeks === 1 ? 'week' : 'weeks'}` : 'N/A',
    },
    {
      label: 'Activities',
      icon: Activity,
      getValue: (pkg: typeof packages[0]) => pkg.calculatedActivities ? `${pkg.calculatedActivities}` : 'N/A',
      highlight: (pkg: typeof packages[0]) => pkg.calculatedActivities === Math.max(...packages.map(p => p.calculatedActivities || 0)),
    },
    {
      label: 'Availability',
      icon: Users,
      getValue: (pkg: typeof packages[0]) => {
        if (pkg.spotsRemaining !== undefined) {
          if (pkg.spotsRemaining <= 5) return `${pkg.spotsRemaining} spots left`;
          return `${pkg.spotsRemaining} available`;
        }
        return 'Check availability';
      },
      highlight: (pkg: typeof packages[0]) => pkg.spotsRemaining !== undefined && pkg.spotsRemaining <= 5,
      warning: (pkg: typeof packages[0]) => pkg.spotsRemaining !== undefined && pkg.spotsRemaining <= 5,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF]">
              <tr>
                <th scope="col" className="px-4 py-4 text-left text-sm font-bold text-white">
                  Compare
                </th>
                {packages.map((pkg) => (
                  <th key={pkg.id} scope="col" className="px-4 py-4 text-center">
                    <div className="space-y-2">
                      <div className="text-white font-bold text-base">{pkg.name}</div>
                      {pkg.popular && (
                        <span className="inline-block px-2 py-0.5 bg-[#FFD700] text-[#1E3A5F] text-[10px] font-bold rounded-full">
                          Popular
                        </span>
                      )}
                      {pkg.id === bestValuePackageId && (
                        <span className="inline-block px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                          Best Value
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Key Metrics */}
              {comparisonRows.map((row, idx) => {
                const Icon = row.icon;
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Icon size={16} className="text-[#0080FF]" />
                        <span>{row.label}</span>
                      </div>
                    </td>
                    {packages.map((pkg) => {
                      const isHighlighted = row.highlight?.(pkg);
                      const isWarning = row.warning?.(pkg);
                      const badge = row.badge?.(pkg);
                      return (
                        <td key={pkg.id} className="px-4 py-3 text-center">
                          <div className={`inline-flex items-center gap-2 ${isHighlighted ? 'font-bold text-[#0080FF]' : 'text-gray-700'}`}>
                            <span className="text-sm">{row.getValue(pkg)}</span>
                            {badge && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                                {badge}
                              </span>
                            )}
                            {isWarning && (
                              <AlertCircle size={14} className="text-orange-500" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* What's Included - Simplified Feature List */}
              {(() => {
                // Get all unique features (expanded) across all packages
                const allUniqueFeatures = new Set<string>();
                expandInheritedFeatures.forEach(features => {
                  features.forEach((f: string) => {
                    const normalized = normalizeFeature(f);
                    allUniqueFeatures.add(normalized);
                  });
                });

                // Find which packages have each feature
                const featurePackageMap = new Map<string, Set<string>>();
                allUniqueFeatures.forEach(normalized => {
                  const packagesWithFeature = new Set<string>();
                  packages.forEach(pkg => {
                    const pkgFeatures = expandInheritedFeatures.get(pkg.id) || [];
                    if (pkgFeatures.some((f: string) => normalizeFeature(f) === normalized)) {
                      packagesWithFeature.add(pkg.id);
                    }
                  });
                  featurePackageMap.set(normalized, packagesWithFeature);
                });

                // Separate common vs differentiating features
                const commonFeatures: string[] = [];
                const differentiatingFeatures: Array<{ name: string; packages: Set<string> }> = [];
                
                featurePackageMap.forEach((packageSet, normalized) => {
                  // Find the original feature name (most common variant)
                  let originalName = normalized;
                  packages.forEach(pkg => {
                    const pkgFeatures = expandInheritedFeatures.get(pkg.id) || [];
                    const matchingFeature = pkgFeatures.find((f: string) => normalizeFeature(f) === normalized);
                    if (matchingFeature) {
                      originalName = matchingFeature;
                    }
                  });

                  // Only count as differentiating if NOT all packages have it AND at least 2 packages have it
                  // (If only 1 package has it, it's truly unique, but we still show it)
                  if (packageSet.size === packages.length) {
                    // All packages have it - common feature
                    commonFeatures.push(originalName);
                  } else if (packageSet.size > 0 && packageSet.size < packages.length) {
                    // Some packages have it - differentiating (but not all)
                    differentiatingFeatures.push({
                      name: originalName,
                      packages: packageSet,
                    });
                  }
                });

                // Sort differentiating features by:
                // 1. Most packages first (most common differences)
                // 2. Then by feature name for consistency
                differentiatingFeatures.sort((a, b) => {
                  if (b.packages.size !== a.packages.size) {
                    return b.packages.size - a.packages.size;
                  }
                  return a.name.localeCompare(b.name);
                });

                return (
                  <>
                    {/* Common Features - Show first, collapsed */}
                    {commonFeatures.length > 0 && (
                      <>
                        <tr className="bg-green-50 border-t-2 border-green-200">
                          <td colSpan={packages.length + 1} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-600" />
                              <div className="text-sm font-bold text-gray-800">
                                Included in All Packages ({commonFeatures.length} features)
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-green-50/30">
                          <td colSpan={packages.length + 1} className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {commonFeatures.slice(0, 8).map((feature, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-green-200 rounded-md text-xs text-gray-700">
                                  <CheckCircle size={12} className="text-green-600" />
                                  {feature}
                                </span>
                              ))}
                              {commonFeatures.length > 8 && (
                                <span className="text-xs text-gray-500 italic px-2 py-1">
                                  +{commonFeatures.length - 8} more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      </>
                    )}

                    {/* Differentiating Features - Show what makes packages different */}
                    {differentiatingFeatures.length > 0 && (
                      <>
                        <tr className="bg-blue-50 border-t-2 border-blue-200">
                          <td colSpan={packages.length + 1} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-[#0080FF]" />
                              <div className="text-sm font-bold text-gray-800">
                                What Makes Each Package Different ({differentiatingFeatures.length} {differentiatingFeatures.length === 1 ? 'feature' : 'features'})
                              </div>
                            </div>
                          </td>
                        </tr>
                        {differentiatingFeatures.slice(0, 15).map((feature) => {
                          // Show which packages have this feature for clarity
                          const packagesWithFeature = Array.from(feature.packages).map(id => 
                            packages.find(p => p.id === id)?.name
                          ).filter(Boolean);
                          const packagesWithoutFeature = packages
                            .filter(p => !feature.packages.has(p.id))
                            .map(p => p.name);
                          
                          return (
                            <tr key={feature.name} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-4 py-2.5">
                                <div className="text-sm font-medium text-gray-700">{feature.name}</div>
                                {packagesWithFeature.length > 0 && packagesWithFeature.length < packages.length && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    In: {packagesWithFeature.join(', ')}
                                  </div>
                                )}
                              </td>
                              {packages.map((pkg) => {
                                const hasFeature = feature.packages.has(pkg.id);
                                return (
                                  <td key={pkg.id} className="px-4 py-2.5 text-center">
                                    {hasFeature ? (
                                      <CheckCircle className="text-green-500" size={18} />
                                    ) : (
                                      <span className="text-gray-300">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        {differentiatingFeatures.length > 15 && (
                          <tr>
                            <td className="px-4 py-2 text-xs text-gray-500 italic" colSpan={packages.length + 1}>
                              + {differentiatingFeatures.length - 15} more differences (view package details for full list)
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </>
                );
              })()}

              {/* Action Row */}
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td className="px-4 py-4"></td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      {pkg.popular ? (
                        <BookingButtonWithChildId
                          packageSlug={pkg.slug}
                          variant="primary"
                          size="sm"
                          className="w-full"
                          withArrow
                        >
                          Book Now
                        </BookingButtonWithChildId>
                      ) : null}
                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="w-full px-4 py-2 text-center text-sm font-semibold text-[#0080FF] border-2 border-[#0080FF] rounded-lg hover:bg-[#0080FF] hover:text-white transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageComparisonTable;


