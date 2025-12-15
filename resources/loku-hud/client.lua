local display = true

local hunger, thirst, stress = 100, 100, 0

local QBCore = exports['qb-core']:GetCoreObject()

-- UPDATE NEEDS
RegisterNetEvent('hud:client:UpdateNeeds', function(newHunger, newThirst)
    hunger = math.min(100, math.max(0, newHunger))
    thirst = math.min(100, math.max(0, newThirst))
end)


-- PLAYER LOADED
RegisterNetEvent('QBCore:Player:SetPlayerData', function(PlayerData)
    hunger = math.min(100, math.max(0, PlayerData.metadata.hunger))
    thirst = math.min(100, math.max(0, PlayerData.metadata.thirst))
end)


-- LOCATION THREAD
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(10)

        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        local streetHash, crossHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
        local streetName = GetStreetNameFromHashKey(streetHash)
        local zoneHash = GetNameOfZone(coords.x, coords.y, coords.z)
        local zoneLabel = GetLabelText(zoneHash)
        local heading = GetEntityHeading(ped)

        SendNUIMessage({
            action = "updateLocation",
            payload = {
                street = streetName,
                zone = zoneLabel,
                headingValue = heading
            }
        })
    end
end)


-- STATUS THREAD
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(100)

        local ped = PlayerPedId()
        local player = PlayerId()
        local coords = GetEntityCoords(ped)

        local health = GetEntityHealth(ped) - 100
        local armor = GetPedArmour(ped)
        local stamina = math.floor(GetPlayerSprintStaminaRemaining(player))
        local oxygen = GetPlayerUnderwaterTimeRemaining(player) * 10

        local stance = 100
        if IsPedDucking(ped) then stance = 50 end

        local zoneHash = GetNameOfZone(coords.x, coords.y, coords.z)
        local zoneLabel = GetLabelText(zoneHash)
        local streetHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
        local streetName = GetStreetNameFromHashKey(streetHash)

        local hours = GetClockHours()
        local minutes = GetClockMinutes()
        if hours < 10 then hours = "0"..hours end
        if minutes < 10 then minutes = "0"..minutes end
        local time = hours..":"..minutes

        local heading = GetEntityHeading(ped)
        local directions = { "N","NE","E","SE","S","SW","W","NW" }
        local compassIndex = math.floor(((heading+22.5)/45.0)%8)+1
        local compass = directions[compassIndex]

        SendNUIMessage({
            action = 'updateStatus',
            payload = {
                health = health,
                armor = armor,
                stamina = stamina,
                oxygen = oxygen,
                hunger = hunger,
                thirst = thirst,
                stress = stress,
                stance = stance,
                street = streetName,
                zone = zoneLabel,
                headingValue = heading,
                compass = compass,
                time = time
            }
        })
    end
end)


-- VEHICLE THREAD
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(50)
        local ped = PlayerPedId()

        if IsPedInAnyVehicle(ped, false) then
            local vehicle = GetVehiclePedIsIn(ped, false)

            local speed = GetEntitySpeed(vehicle) * 3.6
            local rpm = GetVehicleCurrentRpm(vehicle)
            local gear = GetVehicleCurrentGear(vehicle)
            local fuel = GetVehicleFuelLevel(vehicle)
            local engineHealth = GetVehicleEngineHealth(vehicle)
            local bodyHealth = GetVehicleBodyHealth(vehicle)
            

            local _, lightsOn, highbeams = GetVehicleLightsState(vehicle)
            local isLocked = GetVehicleDoorLockStatus(vehicle)
            local lockedBool = (isLocked == 2 or isLocked == 4)

            local class = GetVehicleClass(vehicle)
            local vType = 'car'
            if class == 13 then vType = 'bike'
            elseif class == 14 then vType = 'boat'
            elseif class == 15 or class == 16 then vType = 'heli'
            end

            local altitude = GetEntityHeightAboveGround(vehicle)

            SendNUIMessage({
                action = 'updateVehicle',
                payload = {
                    inVehicle = true,
                    speed = speed,
                    rpm = rpm,
                    gear = gear,
                    fuel = fuel,
                    engineHealth = engineHealth,
                    locked = lockedBool,
                    lightsOn = (lightsOn == 1 or highbeams == 1),
                    type = vType,
                    altitude = altitude,
                    seatbelt = false,
                    engineOn = GetIsVehicleEngineRunning(vehicle)
                }
            })

            DisplayRadar(true)
        else
            SendNUIMessage({
                action = 'updateVehicle',
                payload = { inVehicle = false }
            })
            DisplayRadar(false)
        end
    end
end)


-- VOICE EVENTS
AddEventHandler('pma-voice:setTalkingMode', function(mode)
    SendNUIMessage({
        action = 'updateVoice',
        payload = { range = mode }
    })
end)

AddEventHandler('pma-voice:radioActive', function(radioTalking)
    SendNUIMessage({
        action = 'updateVoice',
        payload = { isRadioTalking = radioTalking }
    })
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(200)
        local talking = NetworkIsPlayerTalking(PlayerId())
        SendNUIMessage({
            action = 'updateVoice',
            payload = { talking = talking }
        })
    end
end)



RegisterCommand('hud', function()
    display = not display
    SendNUIMessage({
        action = 'toggleHud',
        visible = display
    })
    DisplayRadar(display)
end)


local radarState = false

CreateThread(function()
    while not LocalPlayer.state.playerloaded do
        Wait(500)
    end

    -- squaremap
    RequestStreamedTextureDict("squaremap", false)
    while not HasStreamedTextureDictLoaded("squaremap") do
        Wait(100)
    end

    AddReplaceTexture(
        "platform:/textures/graphics",
        "radarmasksm",
        "squaremap",
        "radarmasksm"
    )

    SetMinimapClipType(0) -- square
    SetRadarBigmapEnabled(true, false)
    Wait(100)
    SetRadarBigmapEnabled(false, false)
end)

CreateThread(function()
    while true do
        Wait(500)

        local inVehicle = IsPedInAnyVehicle(PlayerPedId())

        if inVehicle and not radarState then
            radarState = true
            DisplayRadar(true)
        elseif not inVehicle and radarState then
            radarState = false
            DisplayRadar(false)
        end
    end
end)



local cinematic = false

-- MINIMAP RESET (scaleform bug fix)
local function ResetMinimap()
    SetRadarBigmapEnabled(true, false)
    Wait(50)
    SetRadarBigmapEnabled(false, false)
end

-- CINEMATIC 
RegisterCommand("cinematic", function()
    cinematic = not cinematic

    SendNUIMessage({
        action = "toggleCinematic",
        value = cinematic
    })

    if cinematic then
        DisplayRadar(false)
        ResetMinimap()
    else
        local ped = PlayerPedId()
        if IsPedInAnyVehicle(ped, false) then
            DisplayRadar(true)
        else
            DisplayRadar(false)
        end
    end
end, false)


CreateThread(function()
    while true do
        if cinematic then
            Wait(0)

            DisplayRadar(false)

            -- GTA HUD COMPONENTS
            HideHudComponentThisFrame(1)   -- Wanted
            HideHudComponentThisFrame(2)   -- Weapon icon
            HideHudComponentThisFrame(3)   -- Cash
            HideHudComponentThisFrame(4)   -- MP Cash
            HideHudComponentThisFrame(6)   -- Vehicle Name
            HideHudComponentThisFrame(7)   -- Area Name
            HideHudComponentThisFrame(8)   -- Vehicle Class
            HideHudComponentThisFrame(9)   -- Street Name
            HideHudComponentThisFrame(13)  -- Cash Change
            HideHudComponentThisFrame(17)  -- Save Game
            HideHudComponentThisFrame(20)  -- Weapon Wheel
            HideHudComponentThisFrame(22)  -- Health / Armor
        else
            Wait(500)
        end
    end
end)


CreateThread(function()
    while true do
        Wait(0)
        if cinematic then
            SetPlayerHealthRechargeMultiplier(PlayerId(), 0.0)
        else
            SetPlayerHealthRechargeMultiplier(PlayerId(), 1.0)
        end
    end
end)



Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1500)

        local playerPed = PlayerPedId()
        local inVehicle = IsPedInAnyVehicle(playerPed, false)

        SendNUIMessage({
            type = "vehicleStatus",
            inVehicle = inVehicle
        })
    end
end)

AddEventHandler('onClientResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        print("^2[HUD]^7 Client başarıyla yüklendi.")
    end
end)
