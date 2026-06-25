import { PageHeader } from '@/components/common/PageHeader'
import { ExerciseList } from '@/components/activity/ExerciseList'
import { FoodList } from '@/components/activity/FoodList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ActivityPage() {
  return (
    <div>
      <PageHeader title="Activity" description="Log workouts and meals." />
      <Tabs defaultValue="exercise">
        <TabsList className="mb-4">
          <TabsTrigger value="exercise">Exercise</TabsTrigger>
          <TabsTrigger value="food">Food</TabsTrigger>
        </TabsList>
        <TabsContent value="exercise">
          <ExerciseList />
        </TabsContent>
        <TabsContent value="food">
          <FoodList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
