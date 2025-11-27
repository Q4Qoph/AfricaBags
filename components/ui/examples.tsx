'use client'

import React, { useState } from 'react'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Spinner,
  LoadingButton,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  PageLoading,
} from './index'

// Example usage component
export const UIExamples: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="p-8 space-y-8 bg-[#FAF6F1] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2C1810] mb-8">UI Components Library</h1>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Different button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary" size="sm">Primary Small</Button>
              <Button variant="secondary" size="md">Secondary Medium</Button>
              <Button variant="outline" size="lg">Outline Large</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Form inputs with labels and error states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input label="Email" placeholder="Enter your email" />
            <Input
              label="Password"
              type="password"
              error="Password is required"
              placeholder="Enter your password"
            />
            <Input
              label="Name"
              helperText="This will be displayed publicly"
              placeholder="Enter your name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Modal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Modal</CardTitle>
          <CardDescription>Fullscreen modal with backdrop</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        </CardContent>
      </Card>

      {/* Loading Section */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
          <CardDescription>Spinners, skeletons, and loading indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>

            <div>
              <LoadingButton
                isLoading={isLoading}
                className="bg-[#C1502E] text-white px-4 py-2 rounded"
                onClick={handleLoadingDemo}
              >
                Click me
              </LoadingButton>
            </div>

            <div>
              <h4 className="font-medium mb-2">Skeleton Loading</h4>
              <SkeletonText lines={2} />
            </div>

            <div>
              <h4 className="font-medium mb-2">Skeleton Card</h4>
              <SkeletonCard showAvatar showImage />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <ModalHeader>
          <ModalTitle>Confirm Action</ModalTitle>
          <ModalDescription>
            This is an example modal using the design system colors.
            It supports backdrop clicks and escape key to close.
          </ModalDescription>
        </ModalHeader>

        <div className="py-4">
          <p className="text-[#2C1810]">
            This modal demonstrates the terracotta and cream color palette
            with proper accessibility features.
          </p>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}