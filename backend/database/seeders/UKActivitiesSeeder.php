<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UKActivitiesSeeder extends Seeder
{
    /**
     * Seed 105 UK-famous activities with categories
     * Categories match trainer exclusion categories for filtering
     */
    public function run(): void
    {
        // Delete all existing activities first
        Activity::query()->delete();
        
        $activities = [
            // WATER-BASED ACTIVITIES (12)
            ["name" => "Swimming", "category" => "water_based", "description" => "Learn essential swimming skills and water safety", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 4, "age_group_max" => 16],
            ["name" => "Diving", "category" => "water_based", "description" => "Introduction to diving techniques and underwater skills", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Water Polo", "category" => "water_based", "description" => "Team-based water sport combining swimming and ball skills", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Kayaking", "category" => "water_based", "description" => "Paddling skills and water navigation in a kayak", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Canoeing", "category" => "water_based", "description" => "Learn to paddle and navigate in a canoe", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Rowing", "category" => "water_based", "description" => "Develop rowing technique and water endurance", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Sailing", "category" => "water_based", "description" => "Basic sailing skills and boat handling", "difficulty_level" => "intermediate", "duration" => 2.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Surfing", "category" => "water_based", "description" => "Wave riding and balance skills", "difficulty_level" => "intermediate", "duration" => 2.0, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Stand-Up Paddleboarding", "category" => "water_based", "description" => "Balance and paddling on a stand-up board", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Synchronized Swimming", "category" => "water_based", "description" => "Artistic swimming with choreography", "difficulty_level" => "advanced", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Aqua Aerobics", "category" => "water_based", "description" => "Water-based fitness and exercise", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Snorkeling", "category" => "water_based", "description" => "Underwater exploration with mask and snorkel", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            
            // HIGH-INTENSITY SPORTS (15)
            ["name" => "Football", "category" => "high_intensity", "description" => "The beautiful game - UK's most popular sport", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 5, "age_group_max" => 16],
            ["name" => "Rugby Union", "category" => "high_intensity", "description" => "Traditional rugby with 15 players per team", "difficulty_level" => "intermediate", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Rugby League", "category" => "high_intensity", "description" => "Fast-paced rugby variant with 13 players", "difficulty_level" => "intermediate", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Cricket", "category" => "high_intensity", "description" => "Classic British sport with batting and bowling", "difficulty_level" => "beginner", "duration" => 2.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Hockey", "category" => "high_intensity", "description" => "Fast-paced field sport with sticks and ball", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Netball", "category" => "high_intensity", "description" => "Popular UK team sport with passing and shooting", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Basketball", "category" => "high_intensity", "description" => "High-energy sport with dribbling and shooting", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Sprinting", "category" => "high_intensity", "description" => "Short-distance running and speed training", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "CrossFit Kids", "category" => "high_intensity", "description" => "Varied functional fitness for children", "difficulty_level" => "intermediate", "duration" => 1.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "HIIT Training", "category" => "high_intensity", "description" => "High-intensity interval training for fitness", "difficulty_level" => "intermediate", "duration" => 1.0, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Circuit Training", "category" => "high_intensity", "description" => "Rotating exercise stations for full-body fitness", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Boxing", "category" => "high_intensity", "description" => "Fundamental boxing skills and fitness", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Kickboxing", "category" => "high_intensity", "description" => "Striking techniques combining punches and kicks", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Running Club", "category" => "high_intensity", "description" => "Distance running and endurance training", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Athletics", "category" => "high_intensity", "description" => "Track and field events including running and jumping", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            
            // HEIGHTS & CLIMBING (8)
            ["name" => "Rock Climbing", "category" => "heights", "description" => "Outdoor rock face climbing and technique", "difficulty_level" => "intermediate", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Bouldering", "category" => "heights", "description" => "Low-height climbing without ropes", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Indoor Climbing Wall", "category" => "heights", "description" => "Safe indoor climbing with harnesses", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "High Ropes Course", "category" => "heights", "description" => "Elevated obstacle course with safety equipment", "difficulty_level" => "intermediate", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Zip-lining", "category" => "heights", "description" => "Thrilling aerial slide experience", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Abseiling", "category" => "heights", "description" => "Controlled descent down vertical surfaces", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Tree Climbing", "category" => "heights", "description" => "Safe climbing in natural environments", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Adventure Climbing", "category" => "heights", "description" => "Mixed climbing activities and challenges", "difficulty_level" => "intermediate", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            
            // CONTACT SPORTS (12)
            ["name" => "Wrestling", "category" => "contact_sports", "description" => "Grappling techniques and ground control", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Judo", "category" => "contact_sports", "description" => "Japanese martial art focusing on throws", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Karate", "category" => "contact_sports", "description" => "Traditional martial art with strikes and blocks", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Taekwondo", "category" => "contact_sports", "description" => "Korean martial art emphasizing kicks", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Mixed Martial Arts", "category" => "contact_sports", "description" => "Combined martial arts training for youth", "difficulty_level" => "advanced", "duration" => 1.5, "age_group_min" => 12, "age_group_max" => 16],
            ["name" => "Aikido", "category" => "contact_sports", "description" => "Japanese defensive martial art", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Krav Maga", "category" => "contact_sports", "description" => "Israeli self-defense system", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 12, "age_group_max" => 16],
            ["name" => "Brazilian Jiu-Jitsu", "category" => "contact_sports", "description" => "Ground-fighting martial art", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Fencing", "category" => "contact_sports", "description" => "Olympic sword fighting sport", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Lacrosse", "category" => "contact_sports", "description" => "Team sport with stick and ball", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 9, "age_group_max" => 16],
            ["name" => "American Football", "category" => "contact_sports", "description" => "Youth flag or tackle football", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Ice Hockey", "category" => "contact_sports", "description" => "Fast-paced ice sport with physical contact", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            
            // OUTDOOR & EXTREME (15)
            ["name" => "Mountain Biking", "category" => "outdoor_extreme", "description" => "Off-road cycling on trails and terrain", "difficulty_level" => "intermediate", "duration" => 2.0, "age_group_min" => 9, "age_group_max" => 16],
            ["name" => "BMX", "category" => "outdoor_extreme", "description" => "Trick riding on BMX bikes", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Skateboarding", "category" => "outdoor_extreme", "description" => "Board riding and trick training", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Parkour", "category" => "outdoor_extreme", "description" => "Urban movement and obstacle navigation", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Trail Running", "category" => "outdoor_extreme", "description" => "Off-road running on natural paths", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 9, "age_group_max" => 16],
            ["name" => "Orienteering", "category" => "outdoor_extreme", "description" => "Navigation and map-reading adventure", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Road Cycling", "category" => "outdoor_extreme", "description" => "Distance cycling on roads and paths", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Mountain Hiking", "category" => "outdoor_extreme", "description" => "Hillwalking and outdoor exploration", "difficulty_level" => "beginner", "duration" => 3.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Camping Skills", "category" => "outdoor_extreme", "description" => "Outdoor survival and camping techniques", "difficulty_level" => "beginner", "duration" => 4.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Bushcraft", "category" => "outdoor_extreme", "description" => "Wilderness survival skills", "difficulty_level" => "intermediate", "duration" => 3.0, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Geocaching", "category" => "outdoor_extreme", "description" => "GPS treasure hunting adventure", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Archery", "category" => "outdoor_extreme", "description" => "Traditional bow and arrow skills", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Horse Riding", "category" => "outdoor_extreme", "description" => "Equestrian skills and horse care", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Pony Trekking", "category" => "outdoor_extreme", "description" => "Guided pony rides in countryside", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 5, "age_group_max" => 12],
            ["name" => "Scootering", "category" => "outdoor_extreme", "description" => "Scooter riding and trick skills", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            
            // INDOOR & TECHNICAL (20)
            ["name" => "Gymnastics", "category" => "indoor_technical", "description" => "Floor work, vault, bars, and beam", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 4, "age_group_max" => 16],
            ["name" => "Trampolining", "category" => "indoor_technical", "description" => "Aerial skills and trampoline techniques", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 5, "age_group_max" => 16],
            ["name" => "Ballet", "category" => "indoor_technical", "description" => "Classical dance technique and artistry", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 4, "age_group_max" => 16],
            ["name" => "Contemporary Dance", "category" => "indoor_technical", "description" => "Modern expressive dance styles", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Hip Hop Dance", "category" => "indoor_technical", "description" => "Urban dance styles and choreography", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Ballroom Dance", "category" => "indoor_technical", "description" => "Partner dancing and social dance", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Street Dance", "category" => "indoor_technical", "description" => "Freestyle urban dance movement", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Cheerleading", "category" => "indoor_technical", "description" => "Cheer routines, stunts, and tumbling", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Acrobatics", "category" => "indoor_technical", "description" => "Floor tumbling and partner acrobatics", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Rhythmic Gymnastics", "category" => "indoor_technical", "description" => "Dance with apparatus like ribbon and hoop", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Artistic Gymnastics", "category" => "indoor_technical", "description" => "Olympic-style gymnastics apparatus", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Yoga for Kids", "category" => "indoor_technical", "description" => "Child-friendly yoga and mindfulness", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 5, "age_group_max" => 16],
            ["name" => "Pilates", "category" => "indoor_technical", "description" => "Core strength and flexibility training", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Zumba Kids", "category" => "indoor_technical", "description" => "Fun dance fitness for children", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 5, "age_group_max" => 12],
            ["name" => "Table Tennis", "category" => "indoor_technical", "description" => "Fast-paced indoor racket sport", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Badminton", "category" => "indoor_technical", "description" => "Shuttlecock racket sport", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Squash", "category" => "indoor_technical", "description" => "Indoor racket sport with wall", "difficulty_level" => "intermediate", "duration" => 1.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Indoor Tennis", "category" => "indoor_technical", "description" => "Tennis skills in indoor facility", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Ten-Pin Bowling", "category" => "indoor_technical", "description" => "Bowling technique and scoring", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 5, "age_group_max" => 16],
            ["name" => "Futsal", "category" => "indoor_technical", "description" => "Indoor small-sided football", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            
            // SPECIAL NEEDS & ADAPTIVE (8)
            ["name" => "Adaptive PE", "category" => "special_needs", "description" => "Modified physical education for all abilities", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 4, "age_group_max" => 16],
            ["name" => "Wheelchair Basketball", "category" => "special_needs", "description" => "Basketball adapted for wheelchair users", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Wheelchair Rugby", "category" => "special_needs", "description" => "Contact sport adapted for wheelchairs", "difficulty_level" => "intermediate", "duration" => 1.5, "age_group_min" => 10, "age_group_max" => 16],
            ["name" => "Boccia", "category" => "special_needs", "description" => "Precision ball sport for all abilities", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Inclusive Dance", "category" => "special_needs", "description" => "Dance classes for mixed abilities", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 5, "age_group_max" => 16],
            ["name" => "Sensory Sports", "category" => "special_needs", "description" => "Multi-sensory physical activities", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 4, "age_group_max" => 12],
            ["name" => "Therapeutic Swimming", "category" => "special_needs", "description" => "Swimming therapy for special needs", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 4, "age_group_max" => 16],
            ["name" => "Motor Skills Development", "category" => "special_needs", "description" => "Fundamental movement skill building", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 3, "age_group_max" => 10],
            
            // OTHER / GENERAL ACTIVITIES (15)
            ["name" => "Tennis", "category" => "other", "description" => "Classic racket sport on outdoor courts", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Golf", "category" => "other", "description" => "Introduction to golf techniques", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Ultimate Frisbee", "category" => "other", "description" => "Team sport with flying disc", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Rounders", "category" => "other", "description" => "Traditional British bat-and-ball game", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Softball", "category" => "other", "description" => "Team sport similar to baseball", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Dodgeball", "category" => "other", "description" => "Fast-paced ball-throwing team game", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Tag Games", "category" => "other", "description" => "Various chasing and tagging activities", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 4, "age_group_max" => 12],
            ["name" => "Multi-Sport", "category" => "other", "description" => "Rotating through different sports", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 5, "age_group_max" => 12],
            ["name" => "General Fitness", "category" => "other", "description" => "All-around fitness and conditioning", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 7, "age_group_max" => 16],
            ["name" => "Adventure Activities", "category" => "other", "description" => "Mixed outdoor adventure experiences", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 8, "age_group_max" => 16],
            ["name" => "Team Building", "category" => "other", "description" => "Cooperative games and challenges", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Treasure Hunts", "category" => "other", "description" => "Adventure-based problem solving", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 5, "age_group_max" => 12],
            ["name" => "Obstacle Course", "category" => "other", "description" => "Physical challenges and obstacles", "difficulty_level" => "beginner", "duration" => 1.5, "age_group_min" => 6, "age_group_max" => 16],
            ["name" => "Relay Races", "category" => "other", "description" => "Team-based running competitions", "difficulty_level" => "beginner", "duration" => 1.0, "age_group_min" => 5, "age_group_max" => 16],
            ["name" => "Sports Day Events", "category" => "other", "description" => "Traditional school sports activities", "difficulty_level" => "beginner", "duration" => 2.0, "age_group_min" => 5, "age_group_max" => 16],
        ];

        foreach ($activities as $activity) {
            Activity::create([
                "name" => $activity["name"],
                "slug" => Str::slug($activity["name"]),
                "category" => $activity["category"],
                "description" => $activity["description"],
                "difficulty_level" => $activity["difficulty_level"],
                "duration" => $activity["duration"],
                "age_group_min" => $activity["age_group_min"],
                "age_group_max" => $activity["age_group_max"],
                "is_active" => true,
            ]);
        }

        $this->command->info("✅ Successfully seeded " . count($activities) . " UK activities!");
    }
}
