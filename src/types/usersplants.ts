export interface UsersPlant {
  id?: number;
  user_id: string;
  plant_path: string;
  avatar?: string | null;
  plant_name: string;
  scientific_name: string;
  species: string;
  overall_health: string;
  last_scan_date: string;
  plant_information: Record<string, any>;  // JSON blob from Plant.id
  health_assesment: Record<string, any>;   // JSON blob from Plant.id
}
