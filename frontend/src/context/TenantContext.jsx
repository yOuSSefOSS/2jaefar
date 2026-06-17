import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAppContext } from './AppContext';

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const { user } = useAppContext();
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      if (!user) {
        setTenant(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Assuming user has academy_id in their app_metadata or a separate profiles table
        // For now, we will try to fetch the profile first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('academy_id')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile:", profileError);
        }

        const academyId = profile?.academy_id;

        if (academyId) {
          const { data: academy, error: academyError } = await supabase
            .from('academies')
            .select('name, logo_url, primary_color, secondary_color')
            .eq('id', academyId)
            .single();

          if (academyError) {
            console.error("Error fetching academy:", academyError);
          } else if (academy) {
            setTenant(academy);
            
            // Apply CSS variables for the tenant's brand colors dynamically
            if (academy.primary_color) {
              document.documentElement.style.setProperty('--color-tenant-primary', academy.primary_color);
            }
            if (academy.secondary_color) {
              document.documentElement.style.setProperty('--color-tenant-secondary', academy.secondary_color);
            }
          }
        } else {
          // Default or no tenant
          setTenant(null);
          document.documentElement.style.removeProperty('--color-tenant-primary');
          document.documentElement.style.removeProperty('--color-tenant-secondary');
        }
      } catch (err) {
        console.error("Unexpected error fetching tenant:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantConfig();
  }, [user]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};
