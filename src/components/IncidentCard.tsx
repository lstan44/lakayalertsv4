import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, MapPin, Clock, Camera, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import type { Incident } from '../types';
import { updateIncidentVotes } from '../services/incidents';
import { useQueryClient } from '@tanstack/react-query';

interface IncidentCardProps {
  incident: Incident;
}

export default function IncidentCard({ incident }: IncidentCardProps) {
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);
  const { t } = useTranslation();

  const renderMediaItem = (item: { type: string; url: string }, index: number) => {
    if (item.type === 'image') {
      return (
        <img 
          src={item.url} 
          alt={`Incident media ${index + 1}`} 
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    } else {
      return (
        <video 
          src={item.url} 
          controls 
          className="w-full h-48 object-cover rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  const handleVote = async (e: React.MouseEvent, type: 'upvote' | 'downvote') => {
    e.preventDefault();
    if (isVoting) return;

    try {
      setIsVoting(true);
      await updateIncidentVotes(incident.id, type);
      await queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch (error) {
      console.error('Error updating votes:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Link to={`/incident/${incident.id}`}>
      <Card className="w-full max-w-md mx-auto overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-sm font-semibold">
              {t(`incident.types.${incident.type}`)}
            </Badge>
            <Badge 
              variant={incident.severity === 'CRITICAL' ? 'destructive' : 'secondary'} 
              className="text-sm"
            >
              {t(`incident.severity.${incident.severity}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          {incident.incident_media && incident.incident_media.length > 0 && (
            <div className="relative mb-4">
              <Carousel>
                <CarouselContent>
                  {incident.incident_media.map((item, index) => (
                    <CarouselItem key={index}>
                      {renderMediaItem(item, index)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {incident.incident_media.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                  </>
                )}
              </Carousel>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{incident.location.zone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{format(new Date(incident.created_at), 'PPp')}</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={(e) => handleVote(e, 'upvote')}
              disabled={isVoting}
            >
              <ChevronUp className="w-5 h-5 mr-1" />
              <span>{incident.upvotes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
              onClick={(e) => handleVote(e, 'downvote')}
              disabled={isVoting}
            >
              <ChevronDown className="w-5 h-5 mr-1" />
              <span>{incident.downvotes}</span>
            </Button>
          </div>
          <div className="flex space-x-2">
            {incident.incident_media?.some(item => item.type === 'image') && (
              <Camera className="w-5 h-5 text-gray-500" />
            )}
            {incident.incident_media?.some(item => item.type === 'video') && (
              <Video className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}