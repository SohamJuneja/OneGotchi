module one_pet::game {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::TxContext;
    use one::coin::{Self, Coin};
    use one::clock::{Self, Clock};
    use std::string::{Self, String};
    use one::oct::OCT;

    // === CONSTANTS ===
    // 0.01 OCT (9 decimals)
    const MINT_PRICE: u64 = 10_000_000; 
    // 0.001 OCT
    const FEED_PRICE: u64 = 1_000_000;  

    // === STRUCTS ===

    // The Pet NFT
    public struct Pet has key, store {
        id: UID,
        name: String,
        birth_ms: u64,
        last_fed_ms: u64,
        hunger: u64,    // 0-100 (Decays over time)
        happiness: u64, // 0-100
        stage: u8,      // 0:Egg, 1:Baby, 2:Teen, 3:Adult
    }

    // Admin Capability (Owner)
    public struct AdminCap has key { id: UID }

    // === INIT ===
    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
    }

    // === PUBLIC FUNCTIONS ===

    // 1. MINT PET (Paid in OCT)
    public fun mint_pet(
        name: vector<u8>,
        payment: Coin<OCT>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check price
        assert!(coin::value(&payment) >= MINT_PRICE, 0);

        // Burn the OCT (send to null address)
        transfer::public_transfer(payment, @0x0);

        let now = clock::timestamp_ms(clock);

        let pet = Pet {
            id: object::new(ctx),
            name: string::utf8(name),
            birth_ms: now,
            last_fed_ms: now,
            hunger: 0,
            happiness: 100,
            stage: 0
        };

        // Send Pet to User
        transfer::public_transfer(pet, ctx.sender());
    }

    // 2. FEED PET (Paid in OCT)
    public fun feed(
        pet: &mut Pet, 
        payment: Coin<OCT>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) >= FEED_PRICE, 0);
        
        // Burn payment
        transfer::public_transfer(payment, @0x0);

        // Update Stats
        update_state_internal(pet, clock);

        pet.hunger = 0; // Reset hunger
        if (pet.happiness < 100) {
            pet.happiness = pet.happiness + 10;
        };
        pet.last_fed_ms = clock::timestamp_ms(clock);
    }

    // 3. PLAY (Free, increases happiness)
    public fun play(pet: &mut Pet, clock: &Clock, ctx: &mut TxContext) {
        update_state_internal(pet, clock);
        if (pet.happiness < 100) {
            pet.happiness = pet.happiness + 15;
        };
    }

    // 4. EVOLVE (Updates stage based on age)
    public fun evolve(pet: &mut Pet, clock: &Clock, ctx: &mut TxContext) {
        update_state_internal(pet, clock);
        let age = clock::timestamp_ms(clock) - pet.birth_ms;

        // Simple logic: 1 min for Baby, 5 mins for Teen (Demo Speed)
        if (pet.stage == 0 && age > 60000) { pet.stage = 1; };
        if (pet.stage == 1 && age > 300000) { pet.stage = 2; };
        if (pet.stage == 2 && age > 600000) { pet.stage = 3; };
    }

    // INTERNAL HELPER: Calculate decay
    fun update_state_internal(pet: &mut Pet, clock: &Clock) {
        let now = clock::timestamp_ms(clock);
        let time_diff = now - pet.last_fed_ms;
        
        // 1 Hunger point every 30 seconds
        let decay = time_diff / 30000; 

        if (decay > 0) {
            pet.hunger = if (decay > 100) { 100 } else { decay };
            
            // Happiness drops if hungry
            if (pet.hunger > 50) {
                if (pet.happiness > decay) {
                   pet.happiness = pet.happiness - decay;
                } else {
                   pet.happiness = 0;
                }
            }
        };
    }
}
