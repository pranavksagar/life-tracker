import { useState } from 'react'
import { Dumbbell, UtensilsCrossed } from 'lucide-react'
import { ExerciseDialog } from './ExerciseDialog'
import { FoodDialog } from './FoodDialog'
import { Button } from '@/components/ui/button'

/** Two-tap logging buttons for the Today dashboard. */
export function QuickLog() {
  const [exercise, setExercise] = useState(false)
  const [food, setFood] = useState(false)

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" className="h-auto justify-start gap-2 py-3" onClick={() => setExercise(true)}>
        <Dumbbell className="size-4" /> Log workout
      </Button>
      <Button variant="outline" className="h-auto justify-start gap-2 py-3" onClick={() => setFood(true)}>
        <UtensilsCrossed className="size-4" /> Log meal
      </Button>

      <ExerciseDialog open={exercise} onOpenChange={setExercise} />
      <FoodDialog open={food} onOpenChange={setFood} />
    </div>
  )
}
