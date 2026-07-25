// Shape of a record in exercises-dataset/data/exercises.json
export interface RawExercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  target: string;
  muscle_group: string;
  secondary_muscles: string[];
  instructions: Record<string, string>;
  instruction_steps: Record<string, string[]>;
  image: string;
  gif_url: string;
  media_id: string;
  attribution: string;
  created_at: string;
}
