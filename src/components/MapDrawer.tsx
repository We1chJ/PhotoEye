'use client'
import React from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from './ui/button'
import { Map } from 'lucide-react'
import { SidebarMenuButton } from './ui/sidebar'

const MapDrawer = () => {
    return (
        <Drawer direction='left'>
            <DrawerTrigger asChild>
                <SidebarMenuButton asChild tooltip="Map">
                    <a href="#" className="flex items-center gap-2">
                        <Map />
                        <span>Map</span>
                    </a>
                </SidebarMenuButton>
            </DrawerTrigger>
            <DrawerContent className="!w-3/4 !max-w-none">
                <DrawerHeader>
                    <DrawerTitle>Map View</DrawerTitle>
                    <DrawerDescription>Navigate and explore the game world.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    {/* Map content will go here */}
                    <p>Map component content...</p>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default MapDrawer